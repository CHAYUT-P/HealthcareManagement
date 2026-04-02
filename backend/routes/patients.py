from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional

from database import get_session
from models import Patient, Visit, User, Treatment, Appointment
from auth import get_current_active_user, get_password_hash, get_optional_current_user, require_role

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("/", response_model=List[Patient])
def get_patients(name: Optional[str] = None, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    statement = select(Patient)
    if name:
        statement = statement.where(Patient.name.contains(name))
    patients = session.exec(statement).all()
    return patients

@router.get("/search", response_model=List[Patient])
def search_patients(q: Optional[str] = None, skip: int = 0, limit: int = 100, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    from sqlmodel import or_
    statement = select(Patient)
    if q:
        statement = statement.where(
            or_(
                Patient.name.contains(q),
                Patient.national_id.contains(q),
                Patient.hn.contains(q),
                Patient.contact_info.contains(q)
            )
        )
    statement = statement.offset(skip).limit(limit)
    return session.exec(statement).all()

@router.get("/me", response_model=Optional[Patient])
def get_me(session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    patient = session.exec(select(Patient).where(Patient.national_id == current_user.national_id)).first()
    return patient

@router.get("/me/appointments", response_model=List[Appointment])
def get_my_appointments(session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    patient = session.exec(select(Patient).where(Patient.national_id == current_user.national_id)).first()
    if not patient: return []
    return session.exec(select(Appointment).where(Appointment.patient_id == patient.id)).all()

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    contact_info: Optional[str] = None
    address: Optional[str] = None
    blood_type: Optional[str] = None
    known_allergies: Optional[str] = None
    chronic_diseases: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class NurseProfileUpdate(ProfileUpdate):
    national_id: Optional[str] = None
    age: Optional[int] = None

@router.patch("/me/profile", response_model=Patient)
def update_my_profile(profile_in: ProfileUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    patient = session.exec(select(Patient).where(Patient.national_id == current_user.national_id)).first()
    if not patient: raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = profile_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)
    
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient

@router.patch("/{patient_id}/profile", response_model=Patient)
def update_patient_profile_by_staff(patient_id: int, profile_in: NurseProfileUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    if current_user.role not in ["nurse", "doctor", "ADMIN", "NURSE", "DOCTOR"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit patient profiles")
        
    patient = session.get(Patient, patient_id)
    if not patient: raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = profile_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)
        
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient

@router.get("/me/history")
def get_my_history(session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    patient = session.exec(select(Patient).where(Patient.national_id == current_user.national_id)).first()
    if not patient: return []
    
    visits = session.exec(select(Visit).where(Visit.patient_id == patient.id).order_by(Visit.created_at.desc())).all()
    history = []
    for v in visits:
        rx = v.prescription
        
        # Determine if there is a correlated follow-up appointment
        next_appointment = session.exec(
            select(Appointment).where(Appointment.visit_id == v.id)
        ).first()

        history.append({
            "id": v.id,
            "date": v.created_at.isoformat(),
            "chief_complaint": v.vitals.chief_complaint if v.vitals else "None recorded",
            "doctor_name": v.assigned_doctor.username if v.assigned_doctor else "Attending Doctor",
            "diagnosis": v.clinical_note.diagnosis if v.clinical_note else "Pending/None",
            "treatments": v.clinical_note.prescriptions if v.clinical_note else "",
            "medication_cost": rx.total_amount if rx else 0,
            "treatment_fee": v.treatment_fee or 0,
            "grand_total": (rx.total_amount if rx and rx.total_amount else 0) + (v.treatment_fee or 0),
            "prescription_items": [
                {"name": item.medicine_name, "quantity": item.quantity} for item in rx.items
            ] if rx else [],
            "next_appointment": {
                "date": next_appointment.date,
                "time": next_appointment.time,
                "note": next_appointment.appointment_note
            } if next_appointment else None
        })
    return history

class PatientRegister(BaseModel):
    national_id: str
    password: str
    name: str
    email: str

@router.post("/register")
def register_patient(req: PatientRegister, session: Session = Depends(get_session)):
    """Patient self-registration using citizen ID. Links to existing Patient record if found."""
    # Check if user already exists
    existing_user = session.exec(select(User).where(User.username == req.national_id)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this Citizen ID already exists. Please sign in.")
    
    # Create User account with national_id as username
    new_user = User(
        username=req.national_id,
        hashed_password=get_password_hash(req.password),
        role="PATIENT",
        national_id=req.national_id
    )
    session.add(new_user)
    
    # Check if a Patient record already exists (created by nurse for walk-in)
    existing_patient = session.exec(select(Patient).where(Patient.national_id == req.national_id)).first()
    linked = existing_patient is not None
    
    # If no patient record exists, create a blank one
    if not existing_patient:
        new_patient = Patient(
            name=req.name,
            email=req.email,
            age=0,
            gender="Not specified",
            national_id=req.national_id
        )
        session.add(new_patient)
    else:
        # Update existing record with email if provided
        if not existing_patient.email and req.email:
            existing_patient.email = req.email
            session.add(existing_patient)
    
    session.commit()
    return {"message": "Account created successfully", "linked": linked}

@router.post("/", response_model=Patient)
def create_patient(patient: Patient, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient

@router.put("/{patient_id}", response_model=Patient)
def update_patient(patient_id: int, patient_update: Patient, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    patient.name = patient_update.name
    patient.age = patient_update.age
    patient.gender = patient_update.gender
    patient.contact_info = patient_update.contact_info
    
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient

@router.post("/{patient_id}/visits", response_model=Visit)
def create_visit(patient_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    visit = Visit(patient_id=patient.id, status="Waiting for Triage")
    session.add(visit)
    session.commit()
    session.refresh(visit)
    return visit

from pydantic import BaseModel
class QueueRequest(BaseModel):
    patient_id: int

@router.post("/queue", response_model=Visit)
def add_to_queue(req: QueueRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    patient = session.get(Patient, req.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    visit = Visit(patient_id=patient.id, status="Waiting for Triage", triage_level="Green")
    session.add(visit)
    session.commit()
    session.refresh(visit)
    return visit

@router.get("/{patient_id}/history")
def get_patient_history(patient_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    visits = session.exec(select(Visit).where(Visit.patient_id == patient_id).order_by(Visit.created_at.desc())).all()
    history = []
    for v in visits:
        rx = v.prescription
        next_appointment = session.exec(
            select(Appointment).where(Appointment.visit_id == v.id)
        ).first()

        history.append({
            "id": v.id,
            "date": v.created_at.isoformat(),
            "chief_complaint": v.vitals.chief_complaint if v.vitals else "None recorded",
            "doctor_name": "Attending Doctor",
            "diagnosis": v.clinical_note.diagnosis if v.clinical_note else "Pending/None",
            "treatments": v.clinical_note.prescriptions if v.clinical_note else "",
            "medication_cost": rx.total_amount if rx else 0,
            "treatment_fee": v.treatment_fee or 0,
            "grand_total": (rx.total_amount if rx and rx.total_amount else 0) + (v.treatment_fee or 0),
            "prescription_items": [
                {"name": item.medicine_name, "quantity": item.quantity} for item in rx.items
            ] if rx else [],
            "next_appointment": {
                "date": next_appointment.date,
                "time": next_appointment.time,
                "note": next_appointment.appointment_note
            } if next_appointment else None
        })
    return history

@router.get("/queue", response_model=List[Visit])
def get_queue(session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    # Returns all visits not discharged
    visits = session.exec(select(Visit).where(Visit.status != "Discharged")).all()
    return visits

@router.post("/{patient_id}/treatments", response_model=Treatment)
def create_treatment(patient_id: int, treatment: Treatment, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    treatment.patient_id = patient_id
    session.add(treatment)
    session.commit()
    session.refresh(treatment)
    return treatment

@router.get("/{patient_id}/treatments", response_model=List[Treatment])
def get_patient_treatments(patient_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    return session.exec(select(Treatment).where(Treatment.patient_id == patient_id)).all()

@router.put("/treatments/{treatment_id}", response_model=Treatment)
def update_treatment(treatment_id: int, status: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    treatment = session.get(Treatment, treatment_id)
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    treatment.status = status
    if status == "finished":
        from datetime import datetime, timezone
        treatment.finished_at = datetime.now(timezone.utc)
    session.add(treatment)
    session.commit()
    session.refresh(treatment)
    return treatment

@router.post("/{patient_id}/appointments", response_model=Appointment)
def create_appointment(patient_id: int, appointment: Appointment, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    appointment.patient_id = patient_id
    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    return appointment

@router.get("/{patient_id}/appointments", response_model=List[Appointment])
def get_patient_appointments(patient_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    return session.exec(select(Appointment).where(Appointment.patient_id == patient_id)).all()

class AppointmentBookingReq(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    service: str
    date: str
    time: str
    details: Optional[str] = None

@router.post("/appointments/book", response_model=Appointment)
def book_appointment(req: AppointmentBookingReq, session: Session = Depends(get_session), current_user: Optional[User] = Depends(get_optional_current_user)):
    patient = None
    if current_user and current_user.national_id:
        patient = session.exec(select(Patient).where(Patient.national_id == current_user.national_id)).first()
    
    if not patient:
        full_name = f"{req.firstName} {req.lastName}"
        patient = session.exec(select(Patient).where(
            (Patient.email == req.email) | 
            ((Patient.name == full_name) & (Patient.contact_info == req.phone))
        )).first()
        
        if not patient:
            patient = Patient(name=full_name, email=req.email, contact_info=req.phone, age=0, gender="Not specified")
            session.add(patient)
            session.commit()
            session.refresh(patient)
            
    conflict = session.exec(
        select(Appointment).where(
            Appointment.date == req.date, 
            Appointment.time == req.time,
            Appointment.status != "cancelled"
        )
    ).first()
    
    if conflict:
        raise HTTPException(status_code=400, detail="This time slot is already booked.")
            
    appt = Appointment(
        patient_id=patient.id,
        date=req.date,
        time=req.time,
        service=req.service,
        doctor_name="Pending",
        details=req.details,
        status="scheduled"
    )
    session.add(appt)
    session.commit()
    session.refresh(appt)
    return appt

class AppointmentRescheduleReq(BaseModel):
    date: str
    time: str

@router.put("/appointments/{appt_id}/reschedule", response_model=Appointment)
def reschedule_appointment(
    appt_id: int, 
    req: AppointmentRescheduleReq, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_active_user)
):
    appt = session.get(Appointment, appt_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if appt.is_doctor_scheduled:
        raise HTTPException(status_code=403, detail="You cannot reschedule a follow-up appointment scheduled by a doctor. Please contact the clinic.")
        
    conflict = session.exec(
        select(Appointment).where(
            Appointment.date == req.date, 
            Appointment.time == req.time,
            Appointment.status != "cancelled"
        )
    ).first()
    
    if conflict and conflict.id != appt_id:
        raise HTTPException(status_code=400, detail="This time slot is already booked.")
        
    appt.date = req.date
    appt.time = req.time
    session.add(appt)
    session.commit()
    session.refresh(appt)
    return appt


class AppointmentWithPatient(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    date: str
    time: str
    service: str
    doctor_name: str
    details: Optional[str] = None
    status: str
    is_doctor_scheduled: bool

@router.get("/appointments/all", response_model=List[AppointmentWithPatient])
def get_all_appointments(session: Session = Depends(get_session), current_user: User = Depends(require_role(["nurse", "doctor", "ADMIN", "NURSE", "DOCTOR"]))):
    appts = session.exec(select(Appointment, Patient).join(Patient, Appointment.patient_id == Patient.id)).all()
    result = []
    for appt, patient in appts:
        result.append(AppointmentWithPatient(
            id=appt.id,
            patient_id=patient.id,
            patient_name=patient.name,
            date=appt.date,
            time=appt.time,
            service=appt.service,
            doctor_name=appt.doctor_name,
            details=appt.details,
            status=appt.status,
            is_doctor_scheduled=appt.is_doctor_scheduled
        ))
    return result

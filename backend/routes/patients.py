from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional

from database import get_session
from models import Patient, Visit, User, Treatment, Appointment
from auth import get_current_active_user

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
    patient = session.exec(select(Patient).where(Patient.email == current_user.username)).first()
    return patient

@router.get("/me/appointments", response_model=List[Appointment])
def get_my_appointments(session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    patient = session.exec(select(Patient).where(Patient.email == current_user.username)).first()
    if not patient: return []
    return session.exec(select(Appointment).where(Appointment.patient_id == patient.id)).all()

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    contact_info: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

@router.patch("/me/profile", response_model=Patient)
def update_my_profile(profile_in: ProfileUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    patient = session.exec(select(Patient).where(Patient.email == current_user.username)).first()
    if not patient: raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = profile_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)
    
    # If they changed their email, we'd theoretically need to update User.username too
    # But for demo purposes, we will just save the patient record.
    session.add(patient)
    session.commit()
    session.refresh(patient)
    return patient

@router.get("/me/history")
def get_my_history(session: Session = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    patient = session.exec(select(Patient).where(Patient.email == current_user.username)).first()
    if not patient: return []
    
    visits = session.exec(select(Visit).where(Visit.patient_id == patient.id).order_by(Visit.created_at.desc())).all()
    history = []
    for v in visits:
        history.append({
            "id": v.id,
            "date": v.created_at.isoformat(),
            "chief_complaint": v.vitals.chief_complaint if v.vitals else "None recorded",
            "doctor_name": v.assigned_doctor.username if v.assigned_doctor else "Attending Doctor",
            "diagnosis": v.clinical_note.diagnosis if v.clinical_note else "Pending/None",
            "treatments": v.clinical_note.prescriptions if v.clinical_note else ""
        })
    return history

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
        history.append({
            "id": v.id,
            "date": v.created_at.isoformat(),
            "chief_complaint": v.vitals.chief_complaint if v.vitals else "None recorded",
            "doctor_name": "Attending Doctor",
            "diagnosis": v.clinical_note.diagnosis if v.clinical_note else "Pending/None",
            "treatments": v.clinical_note.prescriptions if v.clinical_note else ""
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
        from datetime import datetime
        treatment.finished_at = datetime.utcnow()
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

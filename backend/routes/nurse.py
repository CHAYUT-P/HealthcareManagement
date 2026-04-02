from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional, List

from database import get_session
from models import Vitals, Visit, User, Prescription, PrescriptionItem
from auth import require_role
from pydantic import BaseModel

router = APIRouter(prefix="/nurse", tags=["nurse"])

class VitalsCreate(BaseModel):
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    oxygen_saturation: Optional[int] = None
    chief_complaint: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    lifestyle_history: Optional[str] = None
    triage_level: Optional[str] = "Green"

@router.post("/visits/{visit_id}/vitals", response_model=Vitals)
def add_vitals(
    visit_id: int,
    vitals_in: VitalsCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(["nurse", "NURSE"]))
):
    visit = session.get(Visit, visit_id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    vitals_data = vitals_in.dict(exclude={"triage_level"})
    vitals = Vitals(visit_id=visit_id, **vitals_data)
    session.add(vitals)
    visit.status = "Ready for Doctor"
    if vitals_in.triage_level:
        visit.triage_level = vitals_in.triage_level
    session.add(visit)
    
    session.commit()
    session.refresh(vitals)
    return vitals

class DoctorWithAvailability(BaseModel):
    id: int
    username: str
    is_available: bool

@router.get("/doctors", response_model=List[DoctorWithAvailability])
def get_doctors(session: Session = Depends(get_session), current_user: User = Depends(require_role(["nurse", "NURSE"]))):
    doctors = session.exec(select(User).where(User.role.in_(["doctor", "DOCTOR"]))).all()
    result = []
    
    from models import Visit
    for doc in doctors:
        active_visits = session.exec(
            select(Visit).where(
                Visit.assigned_doctor_id == doc.id,
                Visit.status.in_(["In Consultation", "Ready for Doctor"])
            )
        ).all()
        result.append(DoctorWithAvailability(
            id=doc.id,
            username=doc.get_display_name(session),
            is_available=len(active_visits) == 0
        ))
    return result

class AssignDoctorRequest(BaseModel):
    doctor_id: int

@router.patch("/queue/{visit_id}/assign", response_model=Visit)
def assign_doctor(
    visit_id: int, 
    req: AssignDoctorRequest, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(require_role(["nurse", "NURSE"]))
):
    visit = session.get(Visit, visit_id)
    if not visit: raise HTTPException(status_code=404, detail="Visit not found")
    
    doctor = session.get(User, req.doctor_id)
    if not doctor or doctor.role.lower() != "doctor": raise HTTPException(status_code=400, detail="Invalid doctor assigned")
    
    # Check if doctor is currently available
    busy_visit = session.exec(
        select(Visit).where(
            Visit.assigned_doctor_id == doctor.id,
            Visit.status.in_(["In Consultation", "Ready for Doctor"])
        )
    ).first()
    
    if busy_visit:
        raise HTTPException(
            status_code=400, 
            detail="Doctor is currently busy with another patient. The previous patient must be sent to billing first."
        )
        
    visit.assigned_doctor_id = req.doctor_id
    visit.status = "In Consultation"
    session.add(visit)
    session.commit()
    session.refresh(visit)
    return visit

@router.get("/queue/today")
def get_queue_today(session: Session = Depends(get_session), current_user: User = Depends(require_role(["nurse", "NURSE"]))):
    from datetime import datetime, timedelta, timezone
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    visits = session.exec(
        select(Visit)
        .where(Visit.status != "Discharged")
        .where(Visit.created_at >= cutoff)
    ).all()

    result = []
    for v in visits:
        patient = v.patient
        vitals = v.vitals
        result.append({
            "id": v.id,
            "patient_id": v.patient_id,
            "assigned_doctor_id": v.assigned_doctor_id,
            "status": v.status,
            "triage_level": v.triage_level,
            "created_at": v.created_at.isoformat(),
            "patient": {
                "id": patient.id,
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
                "hn": patient.hn,
                "national_id": patient.national_id,
                "blood_type": patient.blood_type,
                "known_allergies": patient.known_allergies,
                "chronic_diseases": patient.chronic_diseases,
                "contact_info": patient.contact_info,
                "email": patient.email,
                "address": patient.address,
                "emergency_contact_name": patient.emergency_contact_name,
                "emergency_contact_phone": patient.emergency_contact_phone,
            } if patient else None,
            "vitals": {
                "id": vitals.id,
                "visit_id": vitals.visit_id,
                "blood_pressure": vitals.blood_pressure,
                "heart_rate": vitals.heart_rate,
                "temperature": vitals.temperature,
                "weight": vitals.weight,
                "height": vitals.height,
                "oxygen_saturation": vitals.oxygen_saturation,
                "chief_complaint": vitals.chief_complaint,
                "allergies": vitals.allergies,
                "current_medications": vitals.current_medications,
                "lifestyle_history": vitals.lifestyle_history,
            } if vitals else None,
        })
    return result

class BillingItemUpdate(BaseModel):
    item_id: int
    unit_price: float

class BillingFinalizeRequest(BaseModel):
    items: List[BillingItemUpdate]
    treatment_fee: float

@router.get("/billing/queue")
def get_billing_queue(session: Session = Depends(get_session), current_user: User = Depends(require_role(["nurse", "NURSE"]))):
    visits = session.exec(
        select(Visit).where(Visit.status == "PENDING_PAYMENT")
    ).all()
    
    result = []
    for v in visits:
        rx = v.prescription
        result.append({
            "visit_id": v.id,
            "patient_name": v.patient.name,
            "assigned_doctor_id": v.assigned_doctor_id,
            "created_at": v.created_at.isoformat(),
            "prescription_id": rx.id if rx else None,
            "items": [
                {
                    "item_id": item.id,
                    "medicine_name": item.medicine_name,
                    "instructions": item.instructions,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price
                } for item in rx.items
            ] if rx else []
        })
    return result

@router.patch("/billing/{visit_id}/finalize")
def finalize_billing(
    visit_id: int,
    req: BillingFinalizeRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(["nurse", "NURSE"]))
):
    visit = session.get(Visit, visit_id)
    if not visit or visit.status != "PENDING_PAYMENT":
        raise HTTPException(status_code=404, detail="Visit not pending payment")
        
    rx = visit.prescription
    visit.treatment_fee = req.treatment_fee
    
    if not rx:
        # If no prescription, just complete it
        visit.status = "COMPLETED"
        session.add(visit)
        session.commit()
        return {"success": True, "total_amount": visit.treatment_fee}
        
    total = 0.0
    price_map = {item.item_id: item.unit_price for item in req.items}
    
    for rx_item in rx.items:
        if rx_item.id in price_map:
            rx_item.unit_price = price_map[rx_item.id]
            session.add(rx_item)
            total += (rx_item.unit_price * rx_item.quantity)
            
    rx.total_amount = total
    visit.status = "COMPLETED"
    
    session.add(rx)
    session.add(visit)
    session.commit()
    
    grand_total = total + visit.treatment_fee
    return {"success": True, "total_amount": grand_total}

class AppointmentRescheduleReq(BaseModel):
    date: str
    time: str

from models import Appointment

@router.put("/appointments/{appt_id}/reschedule", response_model=Appointment)
def nurse_reschedule_appointment(
    appt_id: int, 
    req: AppointmentRescheduleReq, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(require_role(["nurse", "NURSE"]))
):
    appt = session.get(Appointment, appt_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if not appt.is_doctor_scheduled:
        raise HTTPException(status_code=403, detail="Nurses can only reschedule follow-up appointments scheduled by a doctor.")
        
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

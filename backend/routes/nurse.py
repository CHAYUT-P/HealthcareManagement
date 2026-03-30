from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional, List

from database import get_session
from models import Vitals, Visit, User
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
    current_user: User = Depends(require_role(["nurse"]))
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

@router.get("/doctors", response_model=List[User])
def get_doctors(session: Session = Depends(get_session), current_user: User = Depends(require_role(["nurse"]))):
    return session.exec(select(User).where(User.role == "doctor")).all()

class AssignDoctorRequest(BaseModel):
    doctor_id: int

@router.patch("/queue/{visit_id}/assign", response_model=Visit)
def assign_doctor(
    visit_id: int, 
    req: AssignDoctorRequest, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(require_role(["nurse"]))
):
    visit = session.get(Visit, visit_id)
    if not visit: raise HTTPException(status_code=404, detail="Visit not found")
    
    doctor = session.get(User, req.doctor_id)
    if not doctor or doctor.role != "doctor": raise HTTPException(status_code=400, detail="Invalid doctor assigned")
        
    visit.assigned_doctor_id = req.doctor_id
    visit.status = "In Consultation"
    session.add(visit)
    session.commit()
    session.refresh(visit)
    return visit

@router.get("/queue/today")
def get_queue_today(session: Session = Depends(get_session), current_user: User = Depends(require_role(["nurse"]))):
    from datetime import datetime, timedelta
    cutoff = datetime.utcnow() - timedelta(hours=24)
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

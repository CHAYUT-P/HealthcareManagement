from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Optional

from database import get_session
from models import ClinicalNote, Visit, User, Patient, Vitals
from auth import require_role
from pydantic import BaseModel

router = APIRouter(prefix="/doctor", tags=["doctor"])

class ClinicalNoteCreate(BaseModel):
    physical_examination: Optional[str] = None
    diagnosis: Optional[str] = None
    prescriptions: Optional[str] = None
    lab_orders: Optional[str] = None

@router.get("/current-patient")
def get_current_patient(session: Session = Depends(get_session), current_user: User = Depends(require_role(["doctor"]))):
    from sqlmodel import select
    visit = session.exec(
        select(Visit)
        .where(Visit.assigned_doctor_id == current_user.id)
        .where(Visit.status == "In Consultation")
    ).first()
    
    if not visit:
        return None
        
    return {
        "visit": visit,
        "patient": visit.patient,
        "vitals": visit.vitals
    }

@router.post("/visits/{visit_id}/consult", response_model=ClinicalNote)
def add_consultation(
    visit_id: int,
    note_in: ClinicalNoteCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(["doctor"]))
):
    visit = session.get(Visit, visit_id)
    if not visit or visit.assigned_doctor_id != current_user.id:
        raise HTTPException(status_code=404, detail="Visit not found or not assigned to you")
    
    note = ClinicalNote(visit_id=visit_id, **note_in.dict())
    session.add(note)
    visit.status = "Pending Pharmacy/Billing"
    session.add(visit)
    
    session.commit()
    session.refresh(note)
    return note

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Optional

from database import get_session
from models import ClinicalNote, Visit, User, Patient, Vitals, Prescription, PrescriptionItem
from auth import require_role
from pydantic import BaseModel

router = APIRouter(prefix="/doctor", tags=["doctor"])

from typing import Optional, List

class PrescriptionItemCreate(BaseModel):
    medicine_name: str
    instructions: str
    quantity: int

class ClinicalNoteCreate(BaseModel):
    physical_examination: Optional[str] = None
    diagnosis: Optional[str] = None
    prescriptions: Optional[str] = None
    lab_orders: Optional[str] = None
    prescription_items: Optional[List[PrescriptionItemCreate]] = []
    follow_up_date: Optional[str] = None
    follow_up_time: Optional[str] = None
    follow_up_note: Optional[str] = None

@router.get("/current-patient")
def get_current_patient(session: Session = Depends(get_session), current_user: User = Depends(require_role(["doctor", "DOCTOR"]))):
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
    current_user: User = Depends(require_role(["doctor", "DOCTOR"]))
):
    visit = session.get(Visit, visit_id)
    if not visit or visit.assigned_doctor_id != current_user.id:
        raise HTTPException(status_code=404, detail="Visit not found or not assigned to you")
    
    # Extract and remove follow-up fields from note_data
    note_data = note_in.dict(exclude={"prescription_items", "follow_up_date", "follow_up_time", "follow_up_note"})
    note = ClinicalNote(visit_id=visit_id, **note_data)
    session.add(note)
    visit.status = "PENDING_PAYMENT"
    session.add(visit)
    
    # Process structured prescription items
    if note_in.prescription_items and len(note_in.prescription_items) > 0:
        rx = Prescription(visit_id=visit_id)
        session.add(rx)
        session.commit()
        session.refresh(rx)
        
        for item in note_in.prescription_items:
            rx_item = PrescriptionItem(
                prescription_id=rx.id,
                medicine_name=item.medicine_name,
                instructions=item.instructions,
                quantity=item.quantity
            )
            session.add(rx_item)
            
    # Process follow-up appointment
    if note_in.follow_up_date and note_in.follow_up_time:
        from models import Appointment
        appt = Appointment(
            patient_id=visit.patient_id,
            visit_id=visit.id,
            date=note_in.follow_up_date,
            time=note_in.follow_up_time,
            service="Doctor Follow-up",
            doctor_name=current_user.username,
            details=note_in.follow_up_note,
            is_doctor_scheduled=True,
            appointment_note=note_in.follow_up_note,
            created_by_id=current_user.id
        )
        session.add(appt)
            
    session.commit()
    session.refresh(note)
    return note

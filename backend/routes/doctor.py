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

from models import DoctorStatus, DoctorUnavailableSlot
from sqlmodel import select

@router.get("/status")
def get_status(session: Session = Depends(get_session), current_user: User = Depends(require_role(["doctor", "DOCTOR"]))):
    status = session.exec(select(DoctorStatus).where(DoctorStatus.doctor_id == current_user.id)).first()
    if not status:
        status = DoctorStatus(doctor_id=current_user.id, is_available_now=True)
        session.add(status)
        session.commit()
        session.refresh(status)
    return {"is_available_now": status.is_available_now}

class StatusUpdate(BaseModel):
    is_available_now: bool

@router.post("/status")
def update_status(req: StatusUpdate, session: Session = Depends(get_session), current_user: User = Depends(require_role(["doctor", "DOCTOR"]))):
    status = session.exec(select(DoctorStatus).where(DoctorStatus.doctor_id == current_user.id)).first()
    if not status:
        status = DoctorStatus(doctor_id=current_user.id, is_available_now=req.is_available_now)
    else:
        status.is_available_now = req.is_available_now
    session.add(status)
    session.commit()
    return {"is_available_now": status.is_available_now}

from models import DoctorBlockRule

@router.get("/blockouts")
def get_blockouts(session: Session = Depends(get_session), current_user: User = Depends(require_role(["doctor", "DOCTOR"]))):
    rules = session.exec(select(DoctorBlockRule).where(DoctorBlockRule.doctor_id == current_user.id)).all()
    return rules

class BlockRuleCreate(BaseModel):
    is_recurring: bool
    date: Optional[str] = None
    day_of_week: Optional[str] = None
    is_all_day: bool
    start_time: Optional[str] = None
    end_time: Optional[str] = None

@router.post("/blockouts")
def create_blockout(req: BlockRuleCreate, session: Session = Depends(get_session), current_user: User = Depends(require_role(["doctor", "DOCTOR"]))):
    rule = DoctorBlockRule(
        doctor_id=current_user.id,
        is_recurring=req.is_recurring,
        date=req.date,
        day_of_week=req.day_of_week,
        is_all_day=req.is_all_day,
        start_time=req.start_time,
        end_time=req.end_time
    )
    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule

@router.delete("/blockouts/{rule_id}")
def delete_blockout(rule_id: int, session: Session = Depends(get_session), current_user: User = Depends(require_role(["doctor", "DOCTOR"]))):
    rule = session.get(DoctorBlockRule, rule_id)
    if not rule or rule.doctor_id != current_user.id:
        raise HTTPException(status_code=404, detail="Block rule not found")
    session.delete(rule)
    session.commit()
    return {"status": "deleted"}

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel

from database import get_session
from models import User, Patient
from auth import require_role

router = APIRouter(prefix="/admin", tags=["admin"])

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    status: str
    firstName: str = ""
    lastName: str = ""
    email: str = ""

@router.get("/users", response_model=List[UserResponse])
def get_users(search: Optional[str] = None, session: Session = Depends(get_session), current_user: User = Depends(require_role(["ADMIN"]))):
    # Fetch all users
    users = session.exec(select(User)).all()
    results = []
    
    for u in users:
        # Check if they have a patient record for name/email
        patient = None
        if u.national_id:
            patient = session.exec(select(Patient).where(Patient.national_id == u.national_id)).first()
            
        firstName = u.username
        lastName = ""
        email = u.username if "@" in u.username else ""
        
        if patient:
            name_parts = patient.name.split(" ", 1)
            firstName = name_parts[0]
            if len(name_parts) > 1:
                lastName = name_parts[1]
            if patient.email:
                email = patient.email
        
        # apply search filter
        search_target = f"{firstName} {lastName} {email} {u.username}".lower()
        if search and search.lower() not in search_target:
            continue
            
        results.append(UserResponse(
            id=u.id,
            username=u.username,
            role=u.role,
            status=u.status,
            firstName=firstName,
            lastName=lastName,
            email=email
        ))
        
    return results

class RoleUpdate(BaseModel):
    role: str

@router.patch("/users/{user_id}/role")
def update_user_role(user_id: int, req: RoleUpdate, session: Session = Depends(get_session), current_user: User = Depends(require_role(["ADMIN"]))):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = req.role
    session.add(user)
    session.commit()
    return {"message": "Role updated"}

class StatusUpdate(BaseModel):
    status: str

@router.patch("/users/{user_id}/status")
def update_user_status(user_id: int, req: StatusUpdate, session: Session = Depends(get_session), current_user: User = Depends(require_role(["ADMIN"]))):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = req.status
    session.add(user)
    session.commit()
    return {"message": "Status updated"}

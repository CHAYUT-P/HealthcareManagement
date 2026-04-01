from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    role: str  # 'nurse', 'doctor', or 'PATIENT'
    national_id: Optional[str] = Field(default=None, index=True)  # For linking patients

class Patient(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    age: int
    gender: str
    contact_info: Optional[str] = None
    
    # Phase 4 Medical Fields
    national_id: Optional[str] = Field(default=None, unique=True, index=True)
    hn: Optional[str] = None
    blood_type: Optional[str] = None
    known_allergies: Optional[str] = None
    chronic_diseases: Optional[str] = None
    
    # Phase 5 Contact Fields
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    
    visits: List["Visit"] = Relationship(back_populates="patient")

class Visit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    assigned_doctor_id: Optional[int] = Field(default=None, foreign_key="user.id")
    status: str = Field(default="Waiting for Triage")
    # statuses: "Waiting for Triage", "Ready for Doctor", "In Consultation", "Sent to Pharmacy/Billing", "Discharged"
    triage_level: str = Field(default="Green") # "Red", "Yellow", "Green"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    patient: Patient = Relationship(back_populates="visits")
    assigned_doctor: Optional["User"] = Relationship()
    vitals: Optional["Vitals"] = Relationship(back_populates="visit", sa_relationship_kwargs={'uselist': False})
    clinical_note: Optional["ClinicalNote"] = Relationship(back_populates="visit", sa_relationship_kwargs={'uselist': False})

class Vitals(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    visit_id: int = Field(foreign_key="visit.id")
    
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
    
    visit: Visit = Relationship(back_populates="vitals")

class ClinicalNote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    visit_id: int = Field(foreign_key="visit.id")
    
    physical_examination: Optional[str] = None
    diagnosis: Optional[str] = None
    prescriptions: Optional[str] = None
    lab_orders: Optional[str] = None
    
    visit: Visit = Relationship(back_populates="clinical_note")

class Treatment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    description: str
    status: str = Field(default="current") # 'current' or 'finished'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = None

class Appointment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    date: str
    time: str
    service: str
    doctor_name: str
    status: str = Field(default="scheduled") # 'scheduled', 'completed', 'cancelled'
    created_at: datetime = Field(default_factory=datetime.utcnow)

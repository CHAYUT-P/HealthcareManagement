from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from contextlib import asynccontextmanager

from database import create_db_and_tables, get_session
from models import User
from auth import verify_password, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from routes import patients, nurse, doctor, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    with next(get_session()) as session:
        if not session.exec(select(User)).first():
            from models import Patient
            
            session.add(User(username="admin@example.com", hashed_password=get_password_hash("password123"), role="ADMIN"))

            for i in range(1, 3):
                session.add(User(username=f"nurse{i}@example.com", hashed_password=get_password_hash("password123"), role="nurse"))
                
            for i in range(1, 5):
                session.add(User(username=f"doctor{i}@example.com", hashed_password=get_password_hash("password123"), role="doctor"))

            # Create 5 Unique Patients
            patients_data = [
                {
                    "name": "Sarah Jenkins", "age": 28, "gender": "Female", "contact_info": "555-0101", "email": "patient1@example.com",
                    "national_id": "1-0000-00000-01-1", "hn": "HN-2026-0001", "blood_type": "O+", 
                    "known_allergies": "Penicillin", "chronic_diseases": "None", "address": "123 Maple Street",
                    "emergency_name": "Tom Jenkins", "emergency_phone": "555-0102"
                },
                {
                    "name": "David Chen", "age": 45, "gender": "Male", "contact_info": "555-0201", "email": "patient2@example.com",
                    "national_id": "1-0000-00000-02-1", "hn": "HN-2026-0002", "blood_type": "A-", 
                    "known_allergies": "Peanuts, Shellfish", "chronic_diseases": "Type 2 Diabetes", "address": "456 Oak Avenue",
                    "emergency_name": "Linda Chen", "emergency_phone": "555-0202"
                },
                {
                    "name": "Maria Garcia", "age": 62, "gender": "Female", "contact_info": "555-0301", "email": "patient3@example.com",
                    "national_id": "1-0000-00000-03-1", "hn": "HN-2026-0003", "blood_type": "B+", 
                    "known_allergies": "None", "chronic_diseases": "Hypertension", "address": "789 Pine Road",
                    "emergency_name": "Carlos Garcia", "emergency_phone": "555-0302"
                },
                {
                    "name": "James Wilson", "age": 19, "gender": "Male", "contact_info": "555-0401", "email": "patient4@example.com",
                    "national_id": "1-0000-00000-04-1", "hn": "HN-2026-0004", "blood_type": "AB+", 
                    "known_allergies": "Latex", "chronic_diseases": "Asthma", "address": "321 Elm Street",
                    "emergency_name": "Robert Wilson", "emergency_phone": "555-0402"
                },
                {
                    "name": "Emily Brown", "age": 34, "gender": "Female", "contact_info": "555-0501", "email": "patient5@example.com",
                    "national_id": "1-0000-00000-05-1", "hn": "HN-2026-0005", "blood_type": "O-", 
                    "known_allergies": "Sulfa Drugs", "chronic_diseases": "None", "address": "654 Birch Lane",
                    "emergency_name": "Michael Brown", "emergency_phone": "555-0502"
                }
            ]
            
            for p in patients_data:
                patient_user = User(username=p["national_id"], hashed_password=get_password_hash("password123"), role="PATIENT", national_id=p["national_id"])
                patient_model = Patient(
                    name=p["name"], age=p["age"], gender=p["gender"], contact_info=p["contact_info"], email=p["email"],
                    national_id=p["national_id"], hn=p["hn"], blood_type=p["blood_type"], 
                    known_allergies=p["known_allergies"], chronic_diseases=p["chronic_diseases"], address=p["address"],
                    emergency_contact_name=p["emergency_name"], emergency_contact_phone=p["emergency_phone"]
                )
                session.add(patient_user)
                session.add(patient_model)
                
            session.commit()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(nurse.router)
app.include_router(doctor.router)
app.include_router(admin.router)

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    
    if not user:
        from models import Patient
        patient = session.exec(select(Patient).where(Patient.email == form_data.username)).first()
        if patient and patient.national_id:
            user = session.exec(select(User).where(User.username == patient.national_id)).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

from pydantic import BaseModel
class PublicDoctor(BaseModel):
    id: int
    username: str
    specialty: str = "General Practitioner"

@app.get("/public/doctors", response_model=list[PublicDoctor])
def get_public_doctors(session: Session = Depends(get_session)):
    doctors = session.exec(select(User).where(User.role == "doctor")).all()
    return [
        PublicDoctor(
            id=d.id, 
            username=d.username.split('@')[0].replace('_', ' ').title(),
            specialty="General Practitioner"
        ) for d in doctors
    ]

@app.get("/")
def read_root():
    return {"message": "Healthcare API"}
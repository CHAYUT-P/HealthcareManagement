from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from contextlib import asynccontextmanager

from database import create_db_and_tables, get_session
from models import User
from auth import verify_password, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from routes import patients, nurse, doctor

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Seed initial test users if not exist
    with next(get_session()) as session:
        if not session.exec(select(User)).first():
            from models import Patient
            nurse = User(username="admin_nurse@example.com", hashed_password=get_password_hash("password123"), role="nurse")
            doctor = User(username="admin_doctor@example.com", hashed_password=get_password_hash("password123"), role="doctor")
            patient_user = User(username="patient1@example.com", hashed_password=get_password_hash("password123"), role="PATIENT")
            
            patient_model = Patient(
                name="John Doe", age=30, gender="Male", contact_info="123-456-7890", email="patient1@example.com",
                national_id="1-2345-67890-12-3", hn="HN-2026-0001",
                blood_type="O+", known_allergies="Penicillin, Peanuts",
                chronic_diseases="Hypertension", address="123 Healthcare Ave, Clinic City",
                emergency_contact_name="Jane Doe", emergency_contact_phone="098-765-4321"
            )
            
            session.add(nurse)
            session.add(doctor)
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

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
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

@app.get("/")
def read_root():
    return {"message": "Healthcare API"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    id: int
    title: str
    completed: bool

@app.get("/api/tasks", response_model=list[Task])
def get_tasks():
    return [
        {"id": 1, "title": "Setup FastAPI", "completed": True},
        {"id": 2, "title": "Connect to PostgreSQL", "completed": False}
    ]
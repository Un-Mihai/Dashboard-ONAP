from fastapi import FastAPI, Depends
from parser import parse_file, get_followed_metrics
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
from sqlalchemy.orm import Session


app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
def read_status(db: Session = Depends(get_db)):
    return get_followed_metrics(db)

@app.post("/api/parsefile")
def parse_data():
    return parse_file()
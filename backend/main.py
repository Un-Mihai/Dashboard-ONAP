from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
from sqlalchemy.orm import Session

from parser import parse_file, parse_files,  get_followed_metrics

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/api/status")
def read_status():
    return {"status": "ok", "message": "Backend conectat!"}

@app.get("/api/followed-metrics")
def read_followed_metrics(db: Session = Depends(get_db)):
    return get_followed_metrics(db)

@app.post("/api/parsefile")
def parse_data(db: Session = Depends(get_db)):
    parse_files(db)
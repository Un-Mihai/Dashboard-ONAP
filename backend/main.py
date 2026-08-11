from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from database import get_db
from parser import parse_files
from teste import mark_all_files
from crud import calculate, get_node_names

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

@app.post("/api/unmark_files")
def unmark_files():
    mark_all_files('UNPARSED')

@app.post("/api/parsefile")
def parse_data(db: Session = Depends(get_db)):
    parse_files(db)

@app.get("/api/data")
def get_data(node_name: str, metric: str, bucket_size: str,db: Session = Depends(get_db)):
    tz_ro = timezone(timedelta(hours=3))
    start_time = datetime(2026, 8, 2, 0, 0, 0, tzinfo=tz_ro)
    end_time = datetime(2026, 8, 4, 0, 0, 0, tzinfo=tz_ro)

    return calculate(db, node_name, metric, bucket_size, start_time, end_time)

@app.get("/api/node_names")
def get_all_node_names(db: Session = Depends(get_db)):
    return get_node_names(db)


    
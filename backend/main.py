import json
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from database import get_db
from parser import parse_files
from teste import mark_all_files
from crud import calculate, get_node_names, get_metric_data

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

@app.post("/api/test")
def gest_test(db: Session = Depends(get_db), metric_name: str = "DL_Troughput"):
    return get_metric_data(db, metric_name)

@app.post("/api/parsefile")
def parse_data(db: Session = Depends(get_db)):
    parse_files(db)

tz_ro = timezone(timedelta(hours=3))
@app.post("/api/data")
def get_data(node_name: str, 
             metrics: str, 
             bucket_size: str,
             aggregate: bool = False,
             start_time: datetime = datetime(2026, 8, 2, 0, 0, 0, tzinfo=tz_ro),
             end_time: datetime = datetime(2026, 8, 4, 0, 0, 0, tzinfo=tz_ro), 
             db: Session = Depends(get_db)):

    metrics = json.loads(metrics).get('metrics')
    results = {"gNB": node_name}
    for metric in metrics:
        results[metric] = calculate(db, node_name, metric, bucket_size, aggregate, start_time, end_time)

    return results

@app.post("/api/node_names")
def get_all_node_names(db: Session = Depends(get_db)):
    return get_node_names(db)


    
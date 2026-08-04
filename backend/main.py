from fastapi import FastAPI, Depends
from parser import parse_file
from fastapi.middleware.cors import CORSMiddleware
from database import get_db, engine


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
def read_status():
    return {"status": "Conectat cu succes la backend!"}


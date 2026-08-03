from fastapi import FastAPI

from parser import parse_file

app = FastAPI()

@app.post("/app")
def ceva():
    return list(parse_file())
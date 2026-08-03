from fastapi import FastAPI

app = FastAPI()

@app.post("/app")
def ceva():
    return {"message": "Hello World"}
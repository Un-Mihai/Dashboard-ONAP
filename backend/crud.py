from sqlalchemy.orm import Session
from sqlalchemy import text, insert

from models import TelemetryData

def get_followed_metrics(db: Session):

    query = text("SELECT MEASUREMENT_TYPE FROM dbo.FOLLOWED_METRICS")
    results = db.execute(query).fetchall()

    return [row._mapping.get("MEASUREMENT_TYPE") for row in results]

def save_batch(db:Session, batch):

    db.execute(insert(TelemetryData), batch)
    db.commit()
    
    batch.clear()
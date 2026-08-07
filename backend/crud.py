from sqlalchemy.orm import Session
from sqlalchemy import text

def get_followed_metrics(db: Session):

    query = text("SELECT MEASUREMENT_TYPE FROM dbo.FOLLOWED_METRICS")
    results = db.execute(query).fetchall()

    return [row._mapping.get("MEASUREMENT_TYPE") for row in results]
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from models import Base

load_dotenv()

DB_SERVER = os.getenv("DB_SERVER")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 18 for SQL Server")

 
SQLALCHEMY_DATABASE_URL = (
    f"mssql+pyodbc://{DB_USER}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}?"
    f"driver={DB_DRIVER}&Encrypt=yes&TrustServerCertificate=yes&Connection+Timeout=30"
)

def seed_default_data(db: Session):
    query = text("SELECT TOP 1 * FROM dbo.METRICS")
    if not db.execute(query).fetchall():
        insert_query = text("""
                INSERT INTO dbo.METRICS (NAME,COMPONENTS,FORMULA,AGGREGATION,UNITS) VALUES
	                ('DL_Traffic_Volume','VS.NRASU.PDCP_SDU_USDAT_VOL_DL_SA_PLMN','VS_NRASU_PDCP_SDU_USDAT_VOL_DL_SA_PLMN','SUM','Kb'),
	                ('UL_Traffic_Volume','VS.NRASU.PDCP_SDU_USDAT_VOL_UL_SA_PLMN','VS_NRASU_PDCP_SDU_USDAT_VOL_UL_SA_PLMN','SUM','Kb'),
	                ('DL_Throughput','VS.NRASU.PDCP_SDU_USDAT_VOL_DL_SA_PLMN','VS_NRASU_PDCP_SDU_USDAT_VOL_DL_SA_PLMN * 8 / GRANULARITY','SUM','KB/s'),
	                ('UL_Throughput','VS.NRASU.PDCP_SDU_USDAT_VOL_UL_SA_PLMN','VS_NRASU_PDCP_SDU_USDAT_VOL_UL_SA_PLMN * 8 / GRANULARITY','SUM','KB/s'),
	                ('PRB_DL','VS.NCUPNRG.DL_PRB_USED_DATA_NRG,VS.NCUPNRG.DL_PRB_UTIL_RATIO_DNOM','VS_NCUPNRG_DL_PRB_USED_DATA_NRG / VS_NCUPNRG_DL_PRB_UTIL_RATIO_DNOM * 100','AVG','%'),
	                ('PRB_UL','VS.NCUPNRG.UL_PRB_USED_DATA_NRG,VS.NCUPNRG.UL_PRB_UTIL_RATIO_DNOM','VS_NCUPNRG_UL_PRB_USED_DATA_NRG / VS_NCUPNRG_UL_PRB_UTIL_RATIO_DNOM * 100','AVG','%'),
	                ('Peak_PRB','VS.NCUPNRG.DL_PRB_UTIL_SLOT_MAX_NRG','VS_NCUPNRG_DL_PRB_UTIL_SLOT_MAX_NRG','MAX','%'),
	                ('Cell_Availability','VS.NCAV.SAMPLES_CELL_AVAIL,VS.NCAV.DENOM_CELL_AVAIL,VS.NCAV.NR_CELL_PLAN_UNAVAIL_SAMPLES','VS_NCAV_SAMPLES_CELL_AVAIL / (VS_NCAV_DENOM_CELL_AVAIL - VS_NCAV_NR_CELL_PLAN_UNAVAIL_SAMPLES) * 100','SUM','%'),
	                ('RFM_Energy_Monitoring','VS.SBTS_RFM_Energy_Monitoring.MIN_INPUT_VOLTAGE_IN_RF,VS.SBTS_RFM_Energy_Monitoring.MAX_INPUT_VOLTAGE_IN_RF','(VS_SBTS_RFM_Energy_Monitoring_MIN_INPUT_VOLTAGE_IN_RF + VS_SBTS_RFM_Energy_Monitoring_MAX_INPUT_VOLTAGE_IN_RF) / 2000','AVG','V'),
	                ('RFM_Energy_Consumption','VS.SBTS_RFM_Energy_Monitoring.RU_AVG_PWR_USAGE','VS_SBTS_RFM_Energy_Monitoring_RU_AVG_PWR_USAGE / 1000','SUM','W');
                """)

        db.execute(insert_query)
        db.commit()

    query = text("SELECT TOP 1 * FROM dbo.FOLLOWED_INDICATORS")
    if not db.execute(query).fetchall():
        insert_query = text("""
                        INSERT INTO dbo.FOLLOWED_INDICATORS (MEASUREMENT_TYPE) VALUES
                        ('VS.NCAV.DENOM_CELL_AVAIL'),
                        ('VS.NCAV.NR_CELL_PLAN_UNAVAIL_SAMPLES'),
                        ('VS.NCAV.SAMPLES_CELL_AVAIL'),
                        ('VS.NCUPNRG.DL_PRB_USED_DATA_NRG'),
                        ('VS.NCUPNRG.DL_PRB_UTIL_RATIO_DNOM'),
                        ('VS.NCUPNRG.DL_PRB_UTIL_SLOT_MAX_NRG'),
                        ('VS.NCUPNRG.UL_PRB_USED_DATA_NRG'),
                        ('VS.NCUPNRG.UL_PRB_UTIL_RATIO_DNOM'),
                        ('VS.NRASU.PDCP_SDU_USDAT_VOL_DL_SA_PLMN'),
                        ('VS.NRASU.PDCP_SDU_USDAT_VOL_UL_SA_PLMN'),
                        ('VS.SBTS_RFM_Energy_Monitoring.MAX_INPUT_VOLTAGE_IN_RF'),
                        ('VS.SBTS_RFM_Energy_Monitoring.MIN_INPUT_VOLTAGE_IN_RF'),
                        ('VS.SBTS_RFM_Energy_Monitoring.RU_AVG_PWR_USAGE');
                    """)
        
        db.execute(insert_query)
        db.commit()

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

with SessionLocal() as db:
    try:
        seed_default_data(db)
    except Exception as e:
        print(f"Eroare la popularea datelor: {e}")
        db.rollback()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


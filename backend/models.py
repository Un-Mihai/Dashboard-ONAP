from sqlalchemy import String, Integer, BigInteger, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import datetime

class Base(DeclarativeBase):
    pass

class TelemetryData(Base):
    __tablename__ = "ONAP_DATA"

    id: Mapped[int] = mapped_column("ID", BigInteger, primary_key=True, autoincrement=True)
    vendor_name: Mapped[str] = mapped_column("VENDOR_NAME", String(20), nullable=False)
    node_name: Mapped[str] = mapped_column("NODE_NAME", String(255), nullable=False)
    object_type: Mapped[str] = mapped_column("OBJECT_TYPE", String(20), nullable=False)
    object_id: Mapped[str] = mapped_column("OBJECT_ID", String(255), nullable=False)
    measurement_type: Mapped[str] = mapped_column("MEASUREMENT_TYPE", String(100), nullable=False)
    measurement_value: Mapped[int] = mapped_column("MEASUREMENT_VALUE", BigInteger, nullable=False)
    begin_time: Mapped[datetime] = mapped_column("BEGIN_TIME", DateTime, nullable=False)
    end_time: Mapped[datetime] = mapped_column("END_TIME", DateTime, nullable=False)
    granularity: Mapped[int] = mapped_column("GRANULARITY", Integer, nullable=False)

class Metrics(Base):
    __tablename__ = "FOLLOWED_METRICS"

    measurement_type: Mapped[str] = mapped_column("MEASUREMENT_TYPE", String(100), primary_key=True)
    measurement_units: Mapped[str] = mapped_column("MEASUREMENT_VALUE", String(10))

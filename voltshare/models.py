from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True)
    role = Column(String(20), default="driver")  # driver / host
    trust_strikes = Column(Integer, default=0)
    token_balance = Column(Float, default=1000.0)

    chargers = relationship("Charger", back_populates="host")
    vehicles = relationship("Vehicle", back_populates="driver")
    bookings = relationship("Booking", back_populates="driver")


class Charger(Base):
    __tablename__ = "chargers"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    address = Column(String(255), nullable=False)  # Revealed only when booking is APPROVED
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    h3_index = Column(String(30), index=True, nullable=False)  # Res 8 cell for discovery
    connector_type = Column(String(50), default="Type-2")  # Type-2, 15A-3Pin
    power_kw = Column(Float, default=7.4)                  # e.g., 3.3, 7.4
    hourly_rate = Column(Float, default=18.0)              # Base rate in INR/hour
    is_available = Column(Boolean, default=True)

    host = relationship("User", back_populates="chargers")
    bookings = relationship("Booking", back_populates="charger")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    model_name = Column(String(100), nullable=False)
    battery_capacity_kwh = Column(Float, default=40.5)

    driver = relationship("User", back_populates="vehicles")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    charger_id = Column(Integer, ForeignKey("chargers.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hours = Column(Float, default=2.0)
    status = Column(String(20), default="PENDING")  # PENDING, APPROVED, ARRIVED, ACTIVE, COMPLETED, CANCELLED
    charge_token_pin = Column(String(4), nullable=False)
    total_amount = Column(Float, nullable=False)
    host_payout = Column(Float, nullable=False)      # 90% of total
    platform_fee = Column(Float, nullable=False)     # 10% platform fee
    created_at = Column(DateTime, default=datetime.utcnow)

    charger = relationship("Charger", back_populates="bookings")
    driver = relationship("User", back_populates="bookings")

import os
import random
import math
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Safe StaticFiles import across FastAPI / Starlette versions
from fastapi.staticfiles import StaticFiles
from database import engine, get_db, SessionLocal
from models import Base, User, Charger, Vehicle, Booking

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VoltShare API", description="Peer-to-Peer EV Charging Marketplace Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# H3 Helper Wrappers (Handles H3 v4, v3, and graceful fallback)
# -------------------------------------------------------------
try:
    import h3
    HAS_H3 = True
except ImportError:
    HAS_H3 = False

def latlng_to_res(lat: float, lng: float, res: int) -> str:
    if HAS_H3:
        if hasattr(h3, "latlng_to_cell"):
            return h3.latlng_to_cell(lat, lng, res)
        elif hasattr(h3, "geo_to_h3"):
            return h3.geo_to_h3(lat, lng, res)
    # Fallback synthetic grid cell key if h3 package isn't yet compiled
    step = 0.008 if res == 8 else 0.0018
    return f"h3_sim_{res}_{int(lat / step)}_{int(lng / step)}"

def get_h3_disk(cell: str, k: int = 1) -> List[str]:
    if HAS_H3 and not cell.startswith("h3_sim_"):
        try:
            if hasattr(h3, "grid_disk"):
                return list(h3.grid_disk(cell, k))
            elif hasattr(h3, "k_ring"):
                return list(h3.k_ring(cell, k))
        except Exception:
            pass
    return [cell]

def get_cell_boundary(cell: str) -> List[List[float]]:
    """Returns [[lat, lng], [lat, lng], ...] for GeoJSON / Leaflet polygons."""
    if HAS_H3 and not cell.startswith("h3_sim_"):
        try:
            if hasattr(h3, "cell_to_boundary"):
                coords = h3.cell_to_boundary(cell)
                return [[float(lat), float(lng)] for lat, lng in coords]
            elif hasattr(h3, "h3_to_geo_boundary"):
                coords = h3.h3_to_geo_boundary(cell)
                return [[float(lat), float(lng)] for lat, lng in coords]
        except Exception:
            pass
    # Synthetic hexagon around simulated cell
    if cell.startswith("h3_sim_"):
        try:
            parts = cell.split("_")
            res = int(parts[2])
            step = 0.008 if res == 8 else 0.0018
            center_lat = (int(parts[3]) + 0.5) * step
            center_lng = (int(parts[4]) + 0.5) * step
            radius = step * 0.55
            poly = []
            for i in range(6):
                angle = (i * 60) * math.pi / 180
                poly.append([
                    round(center_lat + radius * math.sin(angle), 6),
                    round(center_lng + radius * math.cos(angle) * 1.15, 6)
                ])
            return poly
        except Exception:
            pass
    return []

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000  # meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# -------------------------------------------------------------
# Pydantic Schemas
# -------------------------------------------------------------
class BookingCreateRequest(BaseModel):
    charger_id: int
    driver_id: int
    hours: float

class StatusUpdateRequest(BaseModel):
    status: str
    pin: Optional[str] = None

class LocationPingRequest(BaseModel):
    lat: float
    lng: float


# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------

@app.get("/api/chargers/nearby")
def get_nearby_chargers(
    lat: float = Query(31.3260, description="User Latitude (e.g. Jalandhar)"),
    lng: float = Query(75.5762, description="User Longitude"),
    db: Session = Depends(get_db)
):
    """
    Computes H3 Resolution 8 neighborhood zones (k=1 ring).
    Pre-booking privacy: Masks exact lat/lng and street addresses.
    Returns aggregated zones with charger counts, avg rates, and boundaries.
    """
    user_res8_cell = latlng_to_res(lat, lng, 8)
    surrounding_cells = get_h3_disk(user_res8_cell, k=1)

    # Fetch available chargers in surrounding cells
    chargers = db.query(Charger).filter(
        Charger.h3_index.in_(surrounding_cells),
        Charger.is_available == True
    ).all()

    # Group by H3 cell for spatial privacy
    zones_map = {}
    for cell in surrounding_cells:
        zones_map[cell] = {
            "h3_index": cell,
            "boundary": get_cell_boundary(cell),
            "charger_count": 0,
            "chargers": [],
            "avg_hourly_rate": 0.0,
        }

    for c in chargers:
        cell = c.h3_index
        if cell not in zones_map:
            zones_map[cell] = {
                "h3_index": cell,
                "boundary": get_cell_boundary(cell),
                "charger_count": 0,
                "chargers": [],
                "avg_hourly_rate": 0.0
            }
        
        # Masked charger representation (No exact street address or exact lat/lng returned)
        zones_map[cell]["chargers"].append({
            "id": c.id,
            "masked_title": f"Community Hub {c.id:02d} ({c.connector_type})",
            "connector_type": c.connector_type,
            "power_kw": c.power_kw,
            "hourly_rate": c.hourly_rate,
            "is_available": c.is_available,
            "area_zone": f"Zone {c.h3_index[-4:].upper()}"
        })
        zones_map[cell]["charger_count"] += 1

    # Calculate zone averages
    result_zones = []
    for cell, data in zones_map.items():
        if data["charger_count"] > 0:
            rates = [item["hourly_rate"] for item in data["chargers"]]
            data["avg_hourly_rate"] = round(sum(rates) / len(rates), 2)
            result_zones.append(data)
        elif len(data["boundary"]) > 0:
            # Include empty adjacent zone polygon for exhibition map shading
            result_zones.append(data)

    return {
        "user_h3_res8": user_res8_cell,
        "zones": result_zones,
        "total_active_chargers": len(chargers)
    }


@app.post("/api/bookings", status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreateRequest, db: Session = Depends(get_db)):
    """
    Submits a booking request.
    Calculates cost: total = (hourly_rate * hours) * 1.10
    Splits: host_payout (90%), platform_fee (10%).
    Generates 4-digit charge_token_pin.
    """
    charger = db.query(Charger).filter(Charger.id == payload.charger_id).first()
    if not charger:
        raise HTTPException(status_code=404, detail="Charger not found")
    if not charger.is_available:
        raise HTTPException(status_code=400, detail="Charger is currently offline")

    driver = db.query(User).filter(User.id == payload.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver user not found")

    base_cost = charger.hourly_rate * payload.hours
    total_amount = round(base_cost * 1.10, 2)     # Includes 10% platform fee
    host_payout = round(total_amount * 0.90, 2)   # 90% Host Payout
    platform_fee = round(total_amount * 0.10, 2)  # 10% Platform Fee

    # Generate 4-digit security PIN for digital handshake
    pin = f"{random.randint(1000, 9999)}"

    new_booking = Booking(
        charger_id=charger.id,
        driver_id=driver.id,
        hours=payload.hours,
        status="PENDING",
        charge_token_pin=pin,
        total_amount=total_amount,
        host_payout=host_payout,
        platform_fee=platform_fee
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return {
        "booking_id": new_booking.id,
        "status": new_booking.status,
        "hours": new_booking.hours,
        "total_amount": new_booking.total_amount,
        "host_payout": new_booking.host_payout,
        "platform_fee": new_booking.platform_fee,
        "charge_token_pin": new_booking.charge_token_pin,
        "message": "Booking request submitted. Awaiting Host Approval."
    }


@app.get("/api/bookings/{booking_id}")
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    charger = db.query(Charger).filter(Charger.id == booking.charger_id).first()
    host = db.query(User).filter(User.id == charger.host_id).first()
    driver = db.query(User).filter(User.id == booking.driver_id).first()

    # Exact location & address are UNLOCKED ONLY IF status != PENDING
    is_revealed = booking.status in ["APPROVED", "ARRIVED", "ACTIVE", "COMPLETED"]

    return {
        "booking_id": booking.id,
        "status": booking.status,
        "hours": booking.hours,
        "charge_token_pin": booking.charge_token_pin,
        "total_amount": booking.total_amount,
        "host_payout": booking.host_payout,
        "platform_fee": booking.platform_fee,
        "charger": {
            "id": charger.id,
            "title": charger.title if is_revealed else f"Community Charger #{charger.id}",
            "address": charger.address if is_revealed else "Address locked until host approval",
            "lat": charger.lat if is_revealed else None,
            "lng": charger.lng if is_revealed else None,
            "power_kw": charger.power_kw,
            "connector_type": charger.connector_type,
            "host_name": host.name if host else "Verified Host",
            "host_strikes": host.trust_strikes if host else 0
        },
        "driver": {
            "id": driver.id,
            "name": driver.name,
            "strikes": driver.trust_strikes,
            "token_balance": driver.token_balance
        }
    }


@app.patch("/api/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Handles state transitions:
    - APPROVED: Host approves -> Unlocks exact lat/lng for driver routing.
    - ACTIVE: Validates driver's 4-digit charge_token_pin before starting power delivery.
    - COMPLETED: Ends session -> Credits host_payout to host's balance.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    target_status = payload.status.upper()

    if target_status == "ACTIVE":
        # Handshake PIN verification
        if not payload.pin or payload.pin.strip() != booking.charge_token_pin:
            raise HTTPException(status_code=400, detail="Invalid 4-digit Charge Token PIN handshake")
        booking.status = "ACTIVE"

    elif target_status == "COMPLETED":
        booking.status = "COMPLETED"
        # Credit payout to host
        charger = db.query(Charger).filter(Charger.id == booking.charger_id).first()
        if charger:
            host = db.query(User).filter(User.id == charger.host_id).first()
            if host:
                host.token_balance = round((host.token_balance or 0.0) + booking.host_payout, 2)

    elif target_status == "APPROVED":
        booking.status = "APPROVED"

    elif target_status in ["PENDING", "ARRIVED", "CANCELLED"]:
        booking.status = target_status

    else:
        raise HTTPException(status_code=400, detail="Unsupported status transition")

    db.commit()
    db.refresh(booking)

    return {
        "booking_id": booking.id,
        "status": booking.status,
        "message": f"Status updated to {booking.status}"
    }


@app.post("/api/bookings/{booking_id}/location-ping")
def location_ping(
    booking_id: int,
    payload: LocationPingRequest,
    db: Session = Depends(get_db)
):
    """
    Accepts driver's live (lat, lng).
    Computes distance and Uber H3 Res 9 cell check.
    If driver enters host's Resolution 9 hexagon (~0.1 km² / ~120m), updates status to ARRIVED
    and arms the Anti-Bypass Strike Detector.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    charger = db.query(Charger).filter(Charger.id == booking.charger_id).first()
    if not charger:
        raise HTTPException(status_code=404, detail="Charger not found")

    distance_m = haversine_distance_meters(payload.lat, payload.lng, charger.lat, charger.lng)

    driver_res9 = latlng_to_res(payload.lat, payload.lng, 9)
    host_res9 = latlng_to_res(charger.lat, charger.lng, 9)

    arrived = False
    if distance_m <= 150.0 or driver_res9 == host_res9:
        arrived = True
        if booking.status in ["APPROVED", "PENDING"]:
            booking.status = "ARRIVED"
            db.commit()

    return {
        "booking_id": booking.id,
        "current_status": booking.status,
        "distance_meters": round(distance_m, 1),
        "driver_res9": driver_res9,
        "host_res9": host_res9,
        "arrived": arrived,
        "charge_token_pin": booking.charge_token_pin if arrived else None
    }


@app.post("/api/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    """
    Anti-Bypass (Disintermediation) Mechanics:
    If driver or host cancels while status is 'ARRIVED' (driver already inside host's Res 9 hex),
    both driver and host receive +1 Trust Strike for off-app cash disintermediation attempt.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    charger = db.query(Charger).filter(Charger.id == booking.charger_id).first()
    host = db.query(User).filter(User.id == charger.host_id).first() if charger else None
    driver = db.query(User).filter(User.id == booking.driver_id).first()

    strike_applied = False
    if booking.status in ["ARRIVED", "ACTIVE"]:
        strike_applied = True
        if driver:
            driver.trust_strikes = (driver.trust_strikes or 0) + 1
        if host:
            host.trust_strikes = (host.trust_strikes or 0) + 1

    booking.status = "CANCELLED"
    db.commit()

    return {
        "booking_id": booking.id,
        "status": "CANCELLED",
        "proximity_strike_applied": strike_applied,
        "driver_strikes": driver.trust_strikes if driver else 0,
        "host_strikes": host.trust_strikes if host else 0,
        "warning": "Proximity strike issued! 3 strikes trigger automatic platform suspension." if strike_applied else "Cancelled normally before arrival."
    }


@app.patch("/api/chargers/{charger_id}/toggle")
def toggle_charger_availability(charger_id: int, db: Session = Depends(get_db)):
    charger = db.query(Charger).filter(Charger.id == charger_id).first()
    if not charger:
        raise HTTPException(status_code=404, detail="Charger not found")

    charger.is_available = not charger.is_available
    db.commit()
    db.refresh(charger)

    return {
        "charger_id": charger.id,
        "title": charger.title,
        "is_available": charger.is_available
    }


@app.get("/api/users/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "role": user.role,
        "trust_strikes": user.trust_strikes,
        "token_balance": user.token_balance
    }


@app.post("/api/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    """Seeds demo chargers in Jalandhar & Ludhiana with H3 Resolution 8 cells."""
    return init_seed_data(db)


def init_seed_data(db: Session):
    existing = db.query(User).count()
    if existing > 0:
        return {"message": "Database already seeded", "count": db.query(Charger).count()}

    # 1. Create Demo Users
    driver_user = User(
        name="Aman Sharma",
        phone="+919876500001",
        role="driver",
        trust_strikes=0,
        token_balance=1250.0
    )
    host_user1 = User(
        name="Harpreet Singh",
        phone="+919876500002",
        role="host",
        trust_strikes=0,
        token_balance=3400.0
    )
    host_user2 = User(
        name="Gurmeet Kaur",
        phone="+919876500003",
        role="host",
        trust_strikes=0,
        token_balance=2100.0
    )
    db.add_all([driver_user, host_user1, host_user2])
    db.commit()

    # 2. Driver's Vehicle
    vehicle = Vehicle(
        driver_id=driver_user.id,
        model_name="Tata Nexon EV Max",
        battery_capacity_kwh=40.5
    )
    db.add(vehicle)

    # 3. Seed Chargers in Jalandhar & Ludhiana
    sample_chargers = [
        # Jalandhar (Model Town, Urban Estate, Cantt, Rama Mandi)
        {
            "host_id": host_user1.id,
            "title": "Model Town Kothi Wallbox (7.4kW)",
            "address": "House 142-A, Model Town, Jalandhar",
            "lat": 31.3090,
            "lng": 75.5802,
            "connector_type": "Type-2",
            "power_kw": 7.4,
            "hourly_rate": 20.0,
            "is_available": True
        },
        {
            "host_id": host_user1.id,
            "title": "Urban Estate Phase II Fast Socket (3.3kW)",
            "address": "Plot 88, Urban Estate Phase II, Jalandhar",
            "lat": 31.2855,
            "lng": 75.6020,
            "connector_type": "15A-3Pin",
            "power_kw": 3.3,
            "hourly_rate": 14.0,
            "is_available": True
        },
        {
            "host_id": host_user2.id,
            "title": "Jalandhar Cantt Officer Enclave (7.4kW)",
            "address": "Bungalow 12, Mall Road, Cantt, Jalandhar",
            "lat": 31.2780,
            "lng": 75.6145,
            "connector_type": "Type-2",
            "power_kw": 7.4,
            "hourly_rate": 22.0,
            "is_available": True
        },
        {
            "host_id": host_user2.id,
            "title": "Rama Mandi Highway Driveway (3.3kW)",
            "address": "Near Hoshiarpur Road Bye-pass, Rama Mandi",
            "lat": 31.3340,
            "lng": 75.6310,
            "connector_type": "15A-3Pin",
            "power_kw": 3.3,
            "hourly_rate": 12.0,
            "is_available": True
        },
        {
            "host_id": host_user1.id,
            "title": "Civil Lines Eco Socket (15A)",
            "address": "45 Mahavir Marg, Civil Lines, Jalandhar",
            "lat": 31.3210,
            "lng": 75.5780,
            "connector_type": "15A-3Pin",
            "power_kw": 3.3,
            "hourly_rate": 15.0,
            "is_available": True
        },
        # Ludhiana (Sarabha Nagar, BRS Nagar, Civil Lines)
        {
            "host_id": host_user2.id,
            "title": "Sarabha Nagar Green Driveway (7.4kW)",
            "address": "Main Market Road, Sarabha Nagar, Ludhiana",
            "lat": 30.8872,
            "lng": 75.8115,
            "connector_type": "Type-2",
            "power_kw": 7.4,
            "hourly_rate": 24.0,
            "is_available": True
        },
        {
            "host_id": host_user1.id,
            "title": "BRS Nagar Block C Charger (7.4kW)",
            "address": "Block C, Bhai Randhir Singh Nagar, Ludhiana",
            "lat": 30.8790,
            "lng": 75.7950,
            "connector_type": "Type-2",
            "power_kw": 7.4,
            "hourly_rate": 20.0,
            "is_available": True
        },
        {
            "host_id": host_user2.id,
            "title": "Ferozepur Road Hub (3.3kW)",
            "address": "Opposite PAU Gate 2, Ferozepur Road, Ludhiana",
            "lat": 30.9015,
            "lng": 75.8201,
            "connector_type": "15A-3Pin",
            "power_kw": 3.3,
            "hourly_rate": 13.0,
            "is_available": True
        }
    ]

    for item in sample_chargers:
        h3_res8 = latlng_to_res(item["lat"], item["lng"], 8)
        ch = Charger(
            host_id=item["host_id"],
            title=item["title"],
            address=item["address"],
            lat=item["lat"],
            lng=item["lng"],
            h3_index=h3_res8,
            connector_type=item["connector_type"],
            power_kw=item["power_kw"],
            hourly_rate=item["hourly_rate"],
            is_available=item["is_available"]
        )
        db.add(ch)

    db.commit()
    return {"message": "Seeded demo users and 8 chargers successfully", "count": len(sample_chargers)}

# Auto-seed in dev if empty
with SessionLocal() as db_session:
    try:
        init_seed_data(db_session)
    except Exception as e:
        print(f"Initial seed notice: {e}")

# -------------------------------------------------------------
# Static Files & SPA Routing for Vercel & Local Dev
# -------------------------------------------------------------
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
if os.path.exists(PUBLIC_DIR):
    if StaticFiles is not None:
        try:
            app.mount("/static", StaticFiles(directory=PUBLIC_DIR), name="static")
        except Exception:
            pass

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(PUBLIC_DIR, "index.html"))

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Allow /api routes to be handled by FastAPI
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(PUBLIC_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(PUBLIC_DIR, "index.html"))

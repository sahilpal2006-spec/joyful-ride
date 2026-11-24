import asyncio
from contextlib import suppress
from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB is optional for local development. Without a configured MONGO_URL,
# the app keeps bookings and status checks in process memory.
mongo_url = os.getenv('MONGO_URL')
database_mode = os.getenv('DATABASE_MODE', 'mongo' if mongo_url else 'memory').lower()
if database_mode not in {'memory', 'mongo'}:
    raise ValueError("DATABASE_MODE must be either 'memory' or 'mongo'")
if database_mode == 'mongo':
    if not mongo_url:
        raise ValueError('MONGO_URL is required when DATABASE_MODE=mongo')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.getenv('DB_NAME', 'joyride')]
else:
    client = None
    db = None

memory_bookings: dict[str, dict] = {}
memory_status_checks: list[dict] = []

# One entry per collection: every field a route filters, sorts or dedupes on. Add the index in the same edit as the query.
INDEXES: dict[str, list[IndexModel]] = {
    "status_checks": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("timestamp", DESCENDING)], name="timestamp_desc"),
    ],
    "bookings": [
        IndexModel([("id", ASCENDING)], name="booking_id", unique=True),
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="bookings_user_created"),
    ],
}


async def ensure_indexes() -> None:
    if db is None:
        return
    for collection, models in INDEXES.items():
        for model in models:  # one at a time so a bad spec skips only itself
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:  # never block boot on an index; the log line names what to fix
                logging.getLogger(__name__).error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)

# Create the main app without a prefix
app = FastAPI()

# Probe endpoint for the deployer and pod health checks: root-level (not /api), no DB call.
@app.get("/health", include_in_schema=False)
@app.head("/health", include_in_schema=False)
async def health():
    return {"status": "ok"}

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


@api_router.get("/health", include_in_schema=False)
async def api_health():
    return {"status": "ok"}


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


class Destination(BaseModel):
    id: str
    name: str
    subtitle: str
    distance: str
    color: str
    icon: str


class Vehicle(BaseModel):
    id: str
    name: str
    subtitle: str
    seats: int
    eta: str
    base_fare: float
    accent: str
    icon: str


class EstimateRequest(BaseModel):
    pickup: str = Field(min_length=2)
    dropoff: str = Field(min_length=2)
    vehicle_id: str


class Estimate(BaseModel):
    distance: str
    duration: str
    fare: float
    vehicle_id: str


class BookingCreate(BaseModel):
    user_id: str = "demo-user"
    pickup: str = Field(min_length=2)
    dropoff: str = Field(min_length=2)
    vehicle_id: str
    fare: float = Field(gt=0)
    experience: Optional[str] = None


class Driver(BaseModel):
    name: str
    rating: float
    vehicle: str
    plate: str
    color: str


class Booking(BaseModel):
    id: str
    user_id: str
    pickup: str
    dropoff: str
    vehicle_id: str
    fare: float
    experience: Optional[str] = None
    status: Literal["confirmed", "arriving", "completed"]
    eta: str
    created_at: datetime
    driver: Driver

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "JoyRide API"}


DESTINATIONS = [
    {"id": "harbor", "name": "Sunset Harbor", "subtitle": "Ocean views & fresh air", "distance": "2.4 mi", "color": "#FFE5D9", "icon": "sunny-outline"},
    {"id": "market", "name": "Color Market", "subtitle": "Local bites & happy finds", "distance": "1.8 mi", "color": "#FFF0C2", "icon": "basket-outline"},
    {"id": "garden", "name": "Rose Garden", "subtitle": "A quiet floral escape", "distance": "3.1 mi", "color": "#DDF5EE", "icon": "flower-outline"},
    {"id": "museum", "name": "City Museum", "subtitle": "Stories worth the detour", "distance": "2.9 mi", "color": "#E2ECFF", "icon": "color-palette-outline"},
]

VEHICLES = [
    {"id": "joy", "name": "Joy Ride", "subtitle": "Most popular", "seats": 4, "eta": "3 min", "base_fare": 12.5, "accent": "#FF5722", "icon": "car-sport-outline"},
    {"id": "comfort", "name": "Comfort", "subtitle": "Extra legroom", "seats": 4, "eta": "5 min", "base_fare": 18.0, "accent": "#3A86FF", "icon": "car-outline"},
    {"id": "van", "name": "Joy Van", "subtitle": "Room for everyone", "seats": 6, "eta": "7 min", "base_fare": 24.0, "accent": "#2EC4B6", "icon": "bus-outline"},
]


@api_router.get("/destinations", response_model=List[Destination])
async def get_destinations():
    return [Destination(**item) for item in DESTINATIONS]


@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles():
    return [Vehicle(**item) for item in VEHICLES]


@api_router.post("/rides/estimate", response_model=Estimate)
async def estimate_ride(input: EstimateRequest):
    vehicle = next((item for item in VEHICLES if item["id"] == input.vehicle_id), None)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    route_factor = max(1, (len(input.pickup) + len(input.dropoff)) % 7)
    fare = round(vehicle["base_fare"] + (route_factor * 1.35), 2)
    return Estimate(distance=f"{route_factor + 1}.{route_factor} mi", duration=f"{route_factor + 6} min", fare=fare, vehicle_id=vehicle["id"])


@api_router.post("/bookings", response_model=Booking)
async def create_booking(input: BookingCreate):
    booking_id = f"jr-{uuid.uuid4().hex[:8]}"
    booking = Booking(
        id=booking_id,
        user_id=input.user_id,
        pickup=input.pickup,
        dropoff=input.dropoff,
        vehicle_id=input.vehicle_id,
        fare=input.fare,
        experience=input.experience,
        status="confirmed",
        eta="6 min",
        created_at=datetime.now(timezone.utc),
        driver=Driver(name="Maya Chen", rating=4.98, vehicle="Coral hatchback", plate="JOY 247", color="#FF6B35"),
    )
    booking_doc = booking.model_dump()
    if db is None:
        memory_bookings[booking.id] = booking_doc
    else:
        await db.bookings.insert_one(booking_doc.copy())
    return booking


@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(user_id: str = Query("demo-user")):
    if db is None:
        docs = sorted(
            (item for item in memory_bookings.values() if item["user_id"] == user_id),
            key=lambda item: item["created_at"],
            reverse=True,
        )[:50]
    else:
        docs = await db.bookings.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    return [Booking(**doc) for doc in docs]


@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    doc = memory_bookings.get(booking_id) if db is None else await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Booking not found")
    return Booking(**doc)

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    status_doc = status_obj.model_dump()
    if db is None:
        memory_status_checks.append(status_doc)
    else:
        await db.status_checks.insert_one(status_doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(limit: int = Query(20, ge=1, le=100)):
    if db is None:
        status_checks = sorted(memory_status_checks, key=lambda item: item["timestamp"], reverse=True)[:limit]
    else:
        status_checks = await db.status_checks.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def start_index_build():
    app.state.index_task = asyncio.create_task(ensure_indexes())  # background: a big index build must not block boot

@app.on_event("shutdown")
async def shutdown_db_client():
    app.state.index_task.cancel()  # stop a build still running before its client closes
    with suppress(asyncio.CancelledError):
        await app.state.index_task
    if client is not None:
        client.close()

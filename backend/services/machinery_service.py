"""
Farm Machinery Rental Service — "Uber for Tractors"
Connects small farmers with nearby machinery owners for on-demand equipment rental.
Supports synchronized bookings, double-booking prevention, and role-based filtering.
"""
import uuid
import time
from models import supabase_client

# In-memory structured store with realistic Indian agricultural machinery listings
MACHINERY_STORE = [
    {
        "id": "eq-101",
        "machine_name": "Mahindra 575 DI Power Plus",
        "machine_type": "Tractor",
        "horse_power": 47,
        "price_per_hour": 700.00,
        "price_per_day": 4900.00,
        "rating": 4.8,
        "reviews_count": 34,
        "distance_km": 2.5,
        "location": "Pune Rural, Maharashtra",
        "owner_id": "usr-demo-owner-02",
        "owner_name": "Suresh Singh Machinery",
        "owner_phone": "9876543211",
        "availability": "Available",
        "features": ["Power Steering", "Rotavator Ready", "Dual Clutch", "Low Fuel Burn"],
        "badge": "Popular"
    },
    {
        "id": "eq-102",
        "machine_name": "John Deere 5310 4WD Heavy Duty",
        "machine_type": "Tractor",
        "horse_power": 55,
        "price_per_hour": 850.00,
        "price_per_day": 5800.00,
        "rating": 4.9,
        "reviews_count": 48,
        "distance_km": 6.2,
        "location": "Baramati, Maharashtra",
        "owner_id": "usr-demo-owner-02",
        "owner_name": "Suresh Singh Machinery",
        "owner_phone": "9876543211",
        "availability": "Available",
        "features": ["4-Wheel Drive", "Heavy Cultivation", "AC Cabin", "Laser Leveler Ready"],
        "badge": "Top Rated"
    },
    {
        "id": "eq-103",
        "machine_name": "Swaraj 855 FE Heavy Duty Tractor",
        "machine_type": "Tractor",
        "horse_power": 52,
        "price_per_hour": 650.00,
        "price_per_day": 4500.00,
        "rating": 4.7,
        "reviews_count": 28,
        "distance_km": 3.8,
        "location": "Patna Rural, Bihar",
        "owner_id": "usr-demo-owner-02",
        "owner_name": "Suresh Singh Machinery",
        "owner_phone": "9876543211",
        "availability": "Available",
        "features": ["Multi-Speed PTO", "High Torque", "Plough Compatible", "Easy Hitch"],
        "badge": "Best Value"
    },
    {
        "id": "eq-104",
        "machine_name": "Kubota MU4501 4WD Compact Multi-Crop",
        "machine_type": "Tractor",
        "horse_power": 45,
        "price_per_hour": 750.00,
        "price_per_day": 5200.00,
        "rating": 4.9,
        "reviews_count": 52,
        "distance_km": 4.5,
        "location": "Nashik, Maharashtra",
        "owner_id": "usr-demo-owner-02",
        "owner_name": "Suresh Singh Machinery",
        "owner_phone": "9876543211",
        "availability": "Available",
        "features": ["Japanese Engine", "Paddy Specialist", "Low Soil Compaction", "4WD Traction"],
        "badge": "Top Rated"
    },
    {
        "id": "eq-105",
        "machine_name": "Preet 987 Self Propelled Multi-Crop Combine Harvester",
        "machine_type": "Harvester",
        "horse_power": 101,
        "price_per_hour": 1800.00,
        "price_per_day": 14000.00,
        "rating": 4.8,
        "reviews_count": 19,
        "distance_km": 8.0,
        "location": "Karnal, Haryana",
        "owner_id": "usr-demo-owner-02",
        "owner_name": "Suresh Singh Machinery",
        "owner_phone": "9876543211",
        "availability": "Available",
        "features": ["14-foot Cutter Bar", "Paddy & Wheat Ready", "Grain Tank 2400L", "Minimal Grain Loss"],
        "badge": "Heavy Duty"
    },
    {
        "id": "eq-106",
        "machine_name": "Fieldking Multi-Speed Rotary Tiller (Rotavator)",
        "machine_type": "Rotavator",
        "horse_power": 45,
        "price_per_hour": 450.00,
        "price_per_day": 3200.00,
        "rating": 4.6,
        "reviews_count": 42,
        "distance_km": 1.8,
        "location": "Pune Rural, Maharashtra",
        "owner_id": "usr-demo-owner-02",
        "owner_name": "Suresh Singh Machinery",
        "owner_phone": "9876543211",
        "availability": "Available",
        "features": ["Boron Steel Blades", "Adjustable Skids", "Gear Drive", "Fine Seedbed Prep"],
        "badge": "Best Value"
    },
    {
        "id": "eq-107",
        "machine_name": "Dasmesh 9-Tyne Spring Loaded Cultivator",
        "machine_type": "Cultivator",
        "horse_power": 40,
        "price_per_hour": 350.00,
        "price_per_day": 2400.00,
        "rating": 4.5,
        "reviews_count": 16,
        "distance_km": 5.1,
        "location": "Patna Rural, Bihar",
        "owner_id": "usr-demo-owner-02",
        "owner_name": "Suresh Singh Machinery",
        "owner_phone": "9876543211",
        "availability": "Available",
        "features": ["Heavy Duty Spring", "Deep Tillage", "High Ground Clearance", "Zero Maintenance"],
        "badge": "Standard"
    },
    {
        "id": "eq-108",
        "machine_name": "National 9-Row Automatic Seed cum Fertilizer Drill",
        "machine_type": "Seed Drill",
        "horse_power": 45,
        "price_per_hour": 400.00,
        "price_per_day": 2800.00,
        "rating": 4.7,
        "reviews_count": 23,
        "distance_km": 3.2,
        "location": "Ludhiana, Punjab",
        "owner_id": "usr-demo-owner-02",
        "owner_name": "Suresh Singh Machinery",
        "owner_phone": "9876543211",
        "availability": "Available",
        "features": ["Fluted Roller Metering", "Uniform Seed Depth", "Separate Fertilizer Box", "Wheat/Paddy/Mustard"],
        "badge": "Popular"
    }
]

# Initial Seeded Bookings
BOOKINGS_STORE = [
    {
        "id": "bk-init-101",
        "machinery_id": "eq-101",
        "machine_name": "Mahindra 575 DI Power Plus",
        "machine_type": "Tractor",
        "farmer_id": "usr-demo-farmer-01",
        "farmer_name": "Rameshwar Patel",
        "farmer_phone": "9876543210",
        "phone": "9876543210",
        "service_location": "Patna Rural, Bihar",
        "booking_date": "2026-08-25",
        "start_time": "08:00 AM",
        "duration": 4.0,
        "estimated_hours": 4.0,
        "price_per_hour": 700.00,
        "estimated_cost": 2800.00,
        "owner_id": "usr-demo-owner-02",
        "owner_name": "Suresh Singh Machinery",
        "owner_phone": "9876543211",
        "status": "ACCEPTED",
        "created_at": "2026-08-20 14:30:00",
        "updated_at": "2026-08-20 14:35:00"
    }
]

def list_machinery(location=None, machine_type=None, sort="distance_asc", max_distance=None, search=None):
    """Filters and sorts machinery listings."""
    results = list(MACHINERY_STORE)

    if machine_type and machine_type != "All":
        results = [m for m in results if m["machine_type"].lower() == machine_type.lower()]

    if location and location.strip() and location != "All Locations":
        loc_str = location.lower().strip()
        filtered = [m for m in results if loc_str in m["location"].lower()]
        if filtered:
            results = filtered

    if search and search.strip():
        s = search.lower().strip()
        results = [m for m in results if s in m["machine_name"].lower() or s in m["machine_type"].lower() or s in m["location"].lower() or s in m["owner_name"].lower()]

    if max_distance:
        try:
            d_val = float(max_distance)
            results = [m for m in results if m["distance_km"] <= d_val]
        except ValueError:
            pass

    if sort == "price_asc":
        results.sort(key=lambda x: x["price_per_hour"])
    elif sort == "price_desc":
        results.sort(key=lambda x: x["price_per_hour"], reverse=True)
    elif sort == "rating_desc":
        results.sort(key=lambda x: x["rating"], reverse=True)
    else:
        results.sort(key=lambda x: x["distance_km"])

    return results

def get_machinery_by_id(machinery_id):
    """Fetches single equipment by ID."""
    for m in MACHINERY_STORE:
        if m["id"] == machinery_id:
            return m
    return None

def check_double_booking(machinery_id: str, booking_date: str) -> bool:
    """
    Returns True if an overlapping active booking exists on the same machinery on the given date.
    Active statuses: PENDING, ACCEPTED.
    """
    for b in BOOKINGS_STORE:
        if b.get("machinery_id") == machinery_id and b.get("booking_date") == booking_date:
            curr_status = str(b.get("status", "")).upper()
            if curr_status in ["PENDING", "ACCEPTED"]:
                return True
    return False

def create_booking(data):
    """
    Creates a new machinery booking. Initial status is strictly PENDING.
    Enforces double-booking prevention.
    """
    machinery_id = data.get("machinery_id")
    if not machinery_id:
        return None, "machinery_id is required."

    machinery = get_machinery_by_id(machinery_id)
    if not machinery:
        return None, "Machinery listing not found."

    farmer_id = data.get("farmer_id") or "usr-demo-farmer-01"
    farmer_name = (data.get("farmer_name") or data.get("name") or "").strip()
    phone = (data.get("farmer_phone") or data.get("phone") or "").strip()
    service_location = data.get("service_location", "").strip()
    booking_date = data.get("booking_date", "").strip()
    start_time = data.get("start_time", "08:00 AM").strip()

    if not farmer_name or not phone or not service_location or not booking_date:
        return None, "Please fill in all required booking details (Farmer Name, Phone, Location, Date)."

    # Double Booking Prevention Check
    if check_double_booking(machinery_id, booking_date):
        return None, "This machine is already booked for the selected time."

    try:
        estimated_hours = float(data.get("duration") or data.get("estimated_hours") or 4.0)
        if estimated_hours <= 0 or estimated_hours > 48:
            return None, "Estimated hours must be between 1 and 48."
    except (ValueError, TypeError):
        estimated_hours = 4.0

    price_per_hour = float(machinery["price_per_hour"])
    estimated_cost = round(price_per_hour * estimated_hours, 2)
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")

    booking = {
        "id": f"bk-{uuid.uuid4().hex[:8]}",
        "machinery_id": machinery_id,
        "machine_name": machinery["machine_name"],
        "machine_type": machinery["machine_type"],
        "farmer_id": farmer_id,
        "farmer_name": farmer_name,
        "farmer_phone": phone,
        "phone": phone,
        "service_location": service_location,
        "booking_date": booking_date,
        "start_time": start_time,
        "duration": estimated_hours,
        "estimated_hours": estimated_hours,
        "price_per_hour": price_per_hour,
        "estimated_cost": estimated_cost,
        "total_estimated_cost": estimated_cost,
        "owner_id": machinery.get("owner_id", "usr-demo-owner-02"),
        "owner_name": machinery["owner_name"],
        "owner_phone": machinery["owner_phone"],
        "status": "PENDING",
        "created_at": now_str,
        "updated_at": now_str
    }

    BOOKINGS_STORE.insert(0, booking)
    return booking, None

def get_all_bookings():
    """Returns list of all shared bookings."""
    return list(BOOKINGS_STORE)

def update_booking_status(booking_id, new_status):
    """
    Updates booking status to PENDING, ACCEPTED, REJECTED, CANCELLED, or COMPLETED.
    """
    norm_status = str(new_status or "").strip().upper()
    valid_statuses = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"]
    if norm_status not in valid_statuses:
        return False, f"Invalid status. Must be one of {valid_statuses}"

    for b in BOOKINGS_STORE:
        if b["id"] == booking_id:
            b["status"] = norm_status
            b["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
            return True, None

    return False, "Booking ID not found."

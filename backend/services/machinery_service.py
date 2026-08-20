"""
Farm Machinery Rental Service — "Uber for Tractors"
Connects small farmers with nearby machinery owners for on-demand equipment rental.
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
        "owner_name": "Rajesh Patil",
        "owner_phone": "+91 98234 11201",
        "availability": "Available Now",
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
        "owner_name": "Suresh Kulkarni",
        "owner_phone": "+91 97654 88312",
        "availability": "Available Now",
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
        "owner_name": "Manoj Kumar Singh",
        "owner_phone": "+91 94310 22345",
        "availability": "Available Now",
        "features": ["Multi-Speed PTO", "High Torque", "Plough Compatible", "Easy Hitch"],
        "badge": "Best Value"
    },
    {
        "id": "eq-104",
        "machine_name": "Preet 987 Self-Propelled Multi-Crop Combine",
        "machine_type": "Harvester",
        "horse_power": 101,
        "price_per_hour": 1600.00,
        "price_per_day": 11000.00,
        "rating": 4.9,
        "reviews_count": 29,
        "distance_km": 8.5,
        "location": "Karnal, Haryana",
        "owner_name": "Gurmeet Singh",
        "owner_phone": "+91 94220 54321",
        "availability": "Available Now",
        "features": ["14ft Cutter Bar", "Paddy & Wheat Specialist", "Straw Chopper Included"],
        "badge": "Heavy Duty"
    },
    {
        "id": "eq-105",
        "machine_name": "Claas Crop Tiger 30 Grain Harvester",
        "machine_type": "Harvester",
        "horse_power": 75,
        "price_per_hour": 1800.00,
        "price_per_day": 12500.00,
        "rating": 4.8,
        "reviews_count": 19,
        "distance_km": 12.0,
        "location": "Ludhiana, Punjab",
        "owner_name": "Harpreet Gill",
        "owner_phone": "+91 98140 77654",
        "availability": "Available Now",
        "features": ["Rubber Tracks for Wet Soil", "High Grain Recovery", "Low Grain Loss"],
        "badge": "High Efficiency"
    },
    {
        "id": "eq-106",
        "machine_name": "Shaktiman Semi-Champion 7-Feet Rotavator",
        "machine_type": "Rotavator",
        "horse_power": 50,
        "price_per_hour": 350.00,
        "price_per_day": 2400.00,
        "rating": 4.8,
        "reviews_count": 22,
        "distance_km": 4.5,
        "location": "Ahmednagar, Maharashtra",
        "owner_name": "Vikas Shinde",
        "owner_phone": "+91 98601 99887",
        "availability": "Available Now",
        "features": ["48 Boron Steel Blades", "205cm Working Width", "Multi-Speed Gearbox"],
        "badge": "Tillage Master"
    },
    {
        "id": "eq-107",
        "machine_name": "Fieldking Heavy Duty 9-Tyne Rigid Cultivator",
        "machine_type": "Cultivator",
        "horse_power": 45,
        "price_per_hour": 300.00,
        "price_per_day": 2000.00,
        "rating": 4.7,
        "reviews_count": 16,
        "distance_km": 5.0,
        "location": "Patna, Bihar",
        "owner_name": "Rameshwar Yadav",
        "owner_phone": "+91 94302 88123",
        "availability": "Available Now",
        "features": ["9 Forged Tynes", "Zero Soil Compaction", "High Penetration", "Heavy Frame"],
        "badge": "Affordable"
    },
    {
        "id": "eq-108",
        "machine_name": "National Automatic Seed-Cum-Fertilizer Drill",
        "machine_type": "Seed Drill",
        "horse_power": 45,
        "price_per_hour": 400.00,
        "price_per_day": 2800.00,
        "rating": 4.9,
        "reviews_count": 25,
        "distance_km": 9.2,
        "location": "Agra, Uttar Pradesh",
        "owner_name": "Babanrao Patil",
        "owner_phone": "+91 94231 66778",
        "availability": "Available Now",
        "features": ["9-Row Sowing", "Simultaneous Fertilizer Metering", "Zero-Till Adaptable"],
        "badge": "Precision Sowing"
    }
]

# In-memory bookings store with sample initial confirmed booking
BOOKINGS_STORE = [
    {
        "id": "bk-init-101",
        "machinery_id": "eq-101",
        "machine_name": "Mahindra 575 DI Power Plus",
        "machine_type": "Tractor",
        "farmer_name": "Ramesh Deshmukh",
        "phone": "+91 98765 43210",
        "service_location": "Patna Rural, Bihar",
        "booking_date": "2026-08-22",
        "start_time": "08:00 AM",
        "estimated_hours": 4.0,
        "price_per_hour": 700.00,
        "estimated_cost": 2800.00,
        "owner_name": "Rajesh Patil",
        "owner_phone": "+91 98234 11201",
        "status": "Accepted",
        "created_at": "2026-08-20 14:30:00"
    }
]

def list_machinery(location=None, machine_type=None, sort="distance_asc", max_distance=None, search=None):
    """
    Filters and sorts machinery listings based on location, type, distance, and sorting preference.
    """
    results = list(MACHINERY_STORE)

    # 1. Filter by Machinery Type
    if machine_type and machine_type != "All":
        results = [m for m in results if m["machine_type"].lower() == machine_type.lower()]

    # 2. Filter by Location
    if location and location.strip():
        loc_str = location.lower().strip()
        filtered = [m for m in results if loc_str in m["location"].lower()]
        if filtered:
            results = filtered

    # 3. Filter by Search Query
    if search and search.strip():
        s = search.lower().strip()
        results = [m for m in results if s in m["machine_name"].lower() or s in m["machine_type"].lower() or s in m["location"].lower() or s in m["owner_name"].lower()]

    # 4. Filter by Max Distance
    if max_distance:
        try:
            d_val = float(max_distance)
            results = [m for m in results if m["distance_km"] <= d_val]
        except ValueError:
            pass

    # 5. Sort Results
    if sort == "price_asc":
        results.sort(key=lambda x: x["price_per_hour"])
    elif sort == "price_desc":
        results.sort(key=lambda x: x["price_per_hour"], reverse=True)
    elif sort == "rating_desc":
        results.sort(key=lambda x: x["rating"], reverse=True)
    else:  # distance_asc (default)
        results.sort(key=lambda x: x["distance_km"])

    return results

def get_machinery_by_id(machinery_id):
    """Retrieve single machinery details by ID."""
    for m in MACHINERY_STORE:
        if m["id"] == machinery_id:
            return m
    return None

def create_booking(data):
    """
    Creates a new machinery booking with server-side rate validation.
    Calculates estimated_cost = price_per_hour * estimated_hours on backend.
    """
    machinery_id = data.get("machinery_id")
    if not machinery_id:
        return None, "machinery_id is required."

    machinery = get_machinery_by_id(machinery_id)
    if not machinery:
        return None, "Machinery listing not found."

    farmer_name = data.get("farmer_name", "").strip()
    phone = data.get("phone", "").strip()
    service_location = data.get("service_location", "").strip()
    booking_date = data.get("booking_date", "").strip()
    start_time = data.get("start_time", "08:00 AM").strip()

    if not farmer_name or not phone or not service_location or not booking_date:
        return None, "Please fill in all required booking details (Farmer Name, Phone, Location, Date)."

    try:
        estimated_hours = float(data.get("estimated_hours", 4.0))
        if estimated_hours <= 0 or estimated_hours > 48:
            return None, "Estimated hours must be between 1 and 48."
    except (ValueError, TypeError):
        estimated_hours = 4.0

    # SERVER-SIDE PRICE COMPUTATION (Do NOT trust client price)
    price_per_hour = float(machinery["price_per_hour"])
    estimated_cost = round(price_per_hour * estimated_hours, 2)

    booking = {
        "id": f"bk-{uuid.uuid4().hex[:8]}",
        "machinery_id": machinery_id,
        "machine_name": machinery["machine_name"],
        "machine_type": machinery["machine_type"],
        "farmer_name": farmer_name,
        "phone": phone,
        "service_location": service_location,
        "booking_date": booking_date,
        "start_time": start_time,
        "estimated_hours": estimated_hours,
        "price_per_hour": price_per_hour,
        "estimated_cost": estimated_cost,
        "owner_name": machinery["owner_name"],
        "owner_phone": machinery["owner_phone"],
        "status": "Accepted",  # Status starts as Accepted/Pending in on-demand flow
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    # Save to Supabase or in-memory store
    save_booking_to_database(booking)

    return booking, None

def save_booking_to_database(booking_data):
    """Persists booking to Supabase or in-memory list."""
    try:
        if supabase_client:
            record = {
                "machinery_id": booking_data["machinery_id"],
                "farmer_name": booking_data["farmer_name"],
                "phone": booking_data["phone"],
                "service_location": booking_data["service_location"],
                "booking_date": booking_data["booking_date"],
                "start_time": booking_data["start_time"],
                "estimated_hours": booking_data["estimated_hours"],
                "estimated_cost": booking_data["estimated_cost"],
                "status": booking_data["status"]
            }
            supabase_client.table("machinery_bookings").insert(record).execute()
    except Exception as e:
        print(f"[Supabase] Booking database save fallback: {e}")

    BOOKINGS_STORE.insert(0, booking_data)

def get_all_bookings():
    """Returns list of all bookings for 'My Bookings' section."""
    try:
        if supabase_client:
            res = supabase_client.table("machinery_bookings").select("*, machinery(machine_name, machine_type, owner_name, owner_phone)").order("created_at", desc=True).execute()
            if res.data:
                return res.data
    except Exception as e:
        print(f"[Supabase] Booking fetch fallback: {e}")

    return BOOKINGS_STORE

def update_booking_status(booking_id, new_status):
    """Updates booking status to Pending, Accepted, Completed, or Cancelled."""
    valid_statuses = ["Pending", "Accepted", "Completed", "Cancelled"]
    if new_status not in valid_statuses:
        return False, f"Invalid status. Must be one of {valid_statuses}"

    for b in BOOKINGS_STORE:
        if b["id"] == booking_id:
            b["status"] = new_status
            return True, None

    return False, "Booking not found."

"""
Farm Machinery Rental Service
Manages agricultural equipment marketplace, distance filtering, and booking requests.
"""
import uuid

# In-memory structured store initialized with realistic agricultural machinery
MACHINERY_STORE = [
    {
        "id": "eq-101",
        "name": "Mahindra 575 DI Power Plus (47 HP)",
        "category": "Tractor",
        "model_year": 2023,
        "horse_power": 47,
        "price_per_hour": 450.00,
        "price_per_day": 3200.00,
        "location_city": "Pune Rural",
        "location_state": "Maharashtra",
        "distance_km": 3.8,
        "owner_name": "Rajesh Patil",
        "owner_phone": "+91 98234 11201",
        "rating": 4.9,
        "reviews_count": 28,
        "is_available": True,
        "features": ["Power Steering", "Dual Clutch", "Rotavator Compatible", "Low Fuel Burn"],
        "badge": "Popular"
    },
    {
        "id": "eq-102",
        "name": "John Deere 5310 4WD Heavy Duty (55 HP)",
        "category": "Tractor",
        "model_year": 2024,
        "horse_power": 55,
        "price_per_hour": 600.00,
        "price_per_day": 4200.00,
        "location_city": "Baramati",
        "location_state": "Maharashtra",
        "distance_km": 7.5,
        "owner_name": "Suresh Kulkarni",
        "owner_phone": "+91 97654 88312",
        "rating": 4.9,
        "reviews_count": 42,
        "is_available": True,
        "features": ["4-Wheel Drive", "Heavy Sowing Ready", "Laser Leveler Ready", "AC Cabin"],
        "badge": "Top Rated"
    },
    {
        "id": "eq-103",
        "name": "Preet 987 Self-Propelled Multi-Crop Combine Harvester",
        "category": "Harvester",
        "model_year": 2022,
        "horse_power": 101,
        "price_per_hour": 1400.00,
        "price_per_day": 9800.00,
        "location_city": "Nashik Agri Hub",
        "location_state": "Maharashtra",
        "distance_km": 12.0,
        "owner_name": "Gurmeet Singh",
        "owner_phone": "+91 94220 54321",
        "rating": 4.8,
        "reviews_count": 19,
        "is_available": True,
        "features": ["14ft Cutter Bar", "Wheat & Paddy Specialist", "Straw Chopper Included", "Grain Tank 2.4T"],
        "badge": "Heavy Duty"
    },
    {
        "id": "eq-104",
        "name": "Garuda Hexacopter Precision Agriculture Spray Drone (16L)",
        "category": "Drone Sprayer",
        "model_year": 2024,
        "horse_power": 0,
        "price_per_hour": 750.00,
        "price_per_day": 5000.00,
        "location_city": "Pune Suburbs",
        "location_state": "Maharashtra",
        "distance_km": 4.2,
        "owner_name": "Amit Deshmukh (AgriTech Hub)",
        "owner_phone": "+91 98900 12345",
        "rating": 5.0,
        "reviews_count": 35,
        "is_available": True,
        "features": ["16L Tank", "1 Acre in 7 mins", "Certified Pilot Included", "Terrain Radar"],
        "badge": "AI Powered"
    },
    {
        "id": "eq-105",
        "name": "Shaktiman Semi-Champion 7-Feet Heavy Duty Rotavator",
        "category": "Tillage",
        "model_year": 2023,
        "horse_power": 50,
        "price_per_hour": 300.00,
        "price_per_day": 2000.00,
        "location_city": "Ahmednagar",
        "location_state": "Maharashtra",
        "distance_km": 8.4,
        "owner_name": "Vikas More",
        "owner_phone": "+91 98601 99887",
        "rating": 4.7,
        "reviews_count": 15,
        "is_available": True,
        "features": ["48 Boron Steel Blades", "205cm Working Width", "Multi-Speed Gearbox"],
        "badge": "Affordable"
    },
    {
        "id": "eq-106",
        "name": "Automatic Pneumatic Seed-Cum-Fertilizer Drill (9 Row)",
        "category": "Sowing",
        "model_year": 2023,
        "horse_power": 45,
        "price_per_hour": 380.00,
        "price_per_day": 2500.00,
        "location_city": "Kolhapur",
        "location_state": "Maharashtra",
        "distance_km": 15.1,
        "owner_name": "Babanrao Shinde",
        "owner_phone": "+91 94231 66778",
        "rating": 4.8,
        "reviews_count": 22,
        "is_available": True,
        "features": ["9-Row Sowing", "Simultaneous Fertilizer Metering", "Zero-Till Adaptable"],
        "badge": "Precision Sowing"
    }
]

BOOKINGS_STORE = []

def list_machinery(category=None, max_distance=None, search=None):
    """Filter machinery by category, max distance in km, or search term."""
    results = MACHINERY_STORE
    
    if category and category != "All":
        results = [m for m in results if m["category"].lower() == category.lower()]
        
    if max_distance:
        try:
            dist_val = float(max_distance)
            results = [m for m in results if m["distance_km"] <= dist_val]
        except ValueError:
            pass
            
    if search:
        s = search.lower().strip()
        results = [m for m in results if s in m["name"].lower() or s in m["location_city"].lower() or s in m["category"].lower()]
        
    return results

def get_machinery_by_id(machinery_id):
    """Retrieve single machinery details."""
    for m in MACHINERY_STORE:
        if m["id"] == machinery_id:
            return m
    return None

def create_booking(data):
    """Create a new machinery booking."""
    machinery_id = data.get("machinery_id")
    machinery = get_machinery_by_id(machinery_id)
    if not machinery:
        return None, "Machinery not found"

    hours = int(data.get("duration_hours", 4))
    rate = machinery["price_per_hour"]
    total = hours * rate

    booking = {
        "booking_id": f"AGRO-BK-{uuid.uuid4().hex[:6].upper()}",
        "machinery_id": machinery_id,
        "machinery_name": machinery["name"],
        "category": machinery["category"],
        "farmer_name": data.get("farmer_name", "Farmer User"),
        "farmer_phone": data.get("farmer_phone", "+91 98000 00000"),
        "booking_date": data.get("booking_date", "2026-08-22"),
        "duration_hours": hours,
        "acres_to_cover": data.get("acres_to_cover", 2.5),
        "rate_per_hour": rate,
        "total_amount": total,
        "owner_contact": f"{machinery['owner_name']} ({machinery['owner_phone']})",
        "status": "Confirmed",
        "created_at": "Just now"
    }

    BOOKINGS_STORE.append(booking)
    return booking, None

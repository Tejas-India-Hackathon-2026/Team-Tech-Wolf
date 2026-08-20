"""
AGRO-SMART Admin Management Service
Aggregates platform statistics, moderates machinery listings, inspects rental bookings,
and monitors disease & agro weather activity logs.
"""
from services.auth_service import USERS_STORE, get_all_users, toggle_user_status, change_user_role
from services.machinery_service import MACHINERY_STORE, BOOKINGS_STORE
from services.disease_service import SCANS_STORE, CROP_DISEASE_PROFILES
from services.weather_service import WEATHER_CHECKS_STORE
from services.market_service import CROP_BASE_PRICES, MANDI_LOCATIONS, SUPPORTED_MARKET_CROPS

def get_admin_dashboard_stats():
    """
    Returns platform-wide metrics derived from local demo stores.
    """
    total_users = len(USERS_STORE)
    farmers_count = sum(1 for u in USERS_STORE if u.get("user_type") == "Farmer")
    owners_count = sum(1 for u in USERS_STORE if u.get("user_type") == "Machinery Owner")
    
    total_listings = len(MACHINERY_STORE)
    active_listings = sum(1 for m in MACHINERY_STORE if "Available" in m.get("availability", ""))
    
    total_bookings = len(BOOKINGS_STORE)
    pending_bookings = sum(1 for b in BOOKINGS_STORE if b.get("status") == "Pending")
    
    total_scans = len(SCANS_STORE)
    total_weather_checks = len(WEATHER_CHECKS_STORE)
    
    # Calculate market records count
    total_mandi_records = len(CROP_BASE_PRICES) * len(MANDI_LOCATIONS)

    return {
        "total_users": total_users,
        "farmers_count": farmers_count,
        "owners_count": owners_count,
        "total_listings": total_listings,
        "active_listings": active_listings,
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "total_scans": total_scans,
        "total_weather_checks": total_weather_checks,
        "total_mandi_records": total_mandi_records,
        "is_demo_metrics": True
    }

def get_admin_machinery_list():
    """Returns complete machinery catalog with moderation statuses."""
    return list(MACHINERY_STORE)

def update_admin_machinery_status(machinery_id: str, new_status: str):
    """
    Updates machinery availability or approval status.
    Statuses: 'Available', 'Unavailable', 'Under Review', 'Rejected'
    """
    for m in MACHINERY_STORE:
        if m.get("id") == machinery_id:
            m["availability"] = new_status
            return m, None
    return None, "Machinery listing not found."

def delete_admin_machinery(machinery_id: str):
    """Removes a listing from the marketplace catalog."""
    global MACHINERY_STORE
    for idx, m in enumerate(MACHINERY_STORE):
        if m.get("id") == machinery_id:
            removed = MACHINERY_STORE.pop(idx)
            return removed, None
    return None, "Machinery listing not found."

def get_admin_bookings_list():
    """Returns all rental bookings with farmer and owner details."""
    return list(BOOKINGS_STORE)

def get_admin_activity_logs():
    """Returns recent disease scans and weather check logs."""
    return {
        "disease_scans": SCANS_STORE[:25],
        "weather_checks": WEATHER_CHECKS_STORE[:25]
    }

def get_admin_market_overview():
    """Returns summary of all registered mandis and crops."""
    crops_summary = []
    for crop_name, locations in CROP_BASE_PRICES.items():
        base_price = locations.get("default", {}).get("base", 2000)
        crops_summary.append({
            "crop": crop_name,
            "mandis_count": len(MANDI_LOCATIONS),
            "avg_modal_price": base_price,
            "locations": list(locations.keys())
        })
    return crops_summary

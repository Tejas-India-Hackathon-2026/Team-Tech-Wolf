from flask import Blueprint, request
from services.market_service import (
    get_market_analysis,
    get_all_prices,
    calculate_mandi_arbitrage,
    get_supported_crops,
    get_supported_locations
)
from services.agmarknet_service import get_bihar_mandi_intelligence
from utils.helpers import success_response, error_response

market_bp = Blueprint("market", __name__, url_prefix="/api/market")

BIHAR_DISTRICTS = [
    "Jamui",
    "Lakhisarai",
    "Munger",
    "Bhagalpur",
    "Banka",
    "Nawada",
    "Begusarai",
    "Patna",
    "Gaya",
    "Muzaffarpur",
    "Nalanda",
    "Samastipur",
    "Rohtas",
    "Purnia",
    "Katihar"
]

@market_bp.route("/crops", methods=["GET"])
def list_crops():
    """Returns list of supported crops for market intelligence."""
    crops = get_supported_crops()
    return success_response(crops, message="Market crops list retrieved")

@market_bp.route("/locations", methods=["GET"])
def list_locations():
    """Returns list of supported APMC mandi hubs."""
    locations = get_supported_locations()
    return success_response(locations, message="Market locations list retrieved")

@market_bp.route("/districts", methods=["GET"])
def list_districts():
    """Returns list of Bihar districts supported for local mandi intelligence."""
    state = request.args.get("state", "Bihar")
    return success_response({
        "state": state,
        "districts": BIHAR_DISTRICTS,
        "default_district": "Jamui"
    }, message="Districts fetched successfully")

@market_bp.route("/mandis", methods=["GET"])
def get_mandis():
    """
    Primary Local Mandi Endpoint: GET /api/market/mandis
    Parameters:
      - state: default 'Bihar'
      - district: default 'Jamui'
      - commodity / crop: default 'Tomato'
      - lat / latitude: optional float (farmer GPS)
      - lon / longitude: optional float (farmer GPS)
    Returns structured government/reference mandi prices, Jamui check, and nearby alternative Bihar mandis.
    """
    try:
        state = request.args.get("state", "Bihar")
        district = request.args.get("district", "Jamui")
        commodity = request.args.get("commodity") or request.args.get("crop") or "Tomato"
        
        lat = request.args.get("lat") or request.args.get("latitude")
        lon = request.args.get("lon") or request.args.get("longitude")

        farmer_lat = float(lat) if lat is not None and str(lat).strip() not in {"", "null", "undefined"} else None
        farmer_lon = float(lon) if lon is not None and str(lon).strip() not in {"", "null", "undefined"} else None

        data = get_bihar_mandi_intelligence(
            state=state,
            district=district,
            commodity=commodity,
            farmer_lat=farmer_lat,
            farmer_lon=farmer_lon
        )
        return success_response(data, message="Mandi intelligence retrieved successfully")
    except Exception as e:
        return error_response(message="Failed to retrieve mandi intelligence", details=str(e), status_code=500)

@market_bp.route("/nearby", methods=["GET"])
def get_nearby_mandis():
    """
    Nearby Mandi Search Endpoint: GET /api/market/nearby
    Parameters: latitude, longitude, commodity
    """
    return get_mandis()

@market_bp.route("/analysis", methods=["GET"])
def get_analysis():
    """
    Primary endpoint: GET /api/market/analysis
    Parameters:
      - crop: Tomato, Potato, Onion, Wheat, Rice, Maize
      - location: e.g. "Jamui Mandi, Bihar" or "Patna Mandi, Bihar"
      - days: 7, 15, or 30 (default 30)
    Returns structured JSON with prices, metrics, estimated range, trend, and recommendation.
    """
    try:
        crop = request.args.get("crop", "Tomato")
        location = request.args.get("location", "Jamui Mandi, Bihar")
        days = request.args.get("days", default=30, type=int)

        data = get_market_analysis(crop_name=crop, location=location, days=days)
        return success_response(data, message="Market trend analysis evaluated successfully")
    except Exception as e:
        return error_response(message="Failed to compute market analysis", details=str(e), status_code=500)

@market_bp.route("/prices", methods=["GET"])
def get_market_prices():
    """
    Get live mandi spot prices, metrics, and comparisons.
    Query params: crop (or commodity), location, days
    """
    try:
        crop = request.args.get("crop") or request.args.get("commodity") or "Tomato"
        location = request.args.get("location")
        days = request.args.get("days", default=30, type=int)

        data = get_all_prices(crop=crop, location=location, days=days)
        return success_response(data, message="Market prices retrieved successfully")
    except Exception as e:
        return error_response(message="Failed to retrieve market prices", details=str(e), status_code=500)

@market_bp.route("/arbitrage", methods=["GET"])
def get_arbitrage_analysis():
    """
    Compare mandi prices and compute net margins after logistics costs.
    Query params: commodity (or crop), quantity_quintals, transport_cost_per_km
    """
    try:
        commodity = request.args.get("commodity") or request.args.get("crop") or "Wheat"
        quantity = request.args.get("quantity_quintals", default=50, type=float)
        transport_rate = request.args.get("transport_cost_per_km", default=15, type=float)

        results = calculate_mandi_arbitrage(commodity=commodity, quantity_quintals=quantity, transport_cost_per_km=transport_rate)
        return success_response(results, message="Mandi arbitrage calculated successfully")
    except Exception as e:
        return error_response("Failed to calculate arbitrage", details=str(e), status_code=500)

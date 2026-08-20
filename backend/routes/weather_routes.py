from flask import Blueprint, request
from services.weather_service import (
    get_agro_weather_risk, 
    get_supported_crops, 
    get_supported_locations,
    search_locations,
    get_weather_check_history
)
from utils.helpers import success_response, error_response

weather_bp = Blueprint("weather", __name__, url_prefix="/api/weather")

@weather_bp.route("/risk", methods=["GET"])
def get_weather_risk():
    """
    Primary Endpoint: GET /api/weather/risk
    Parameters:
      - location (or city, q): e.g. "Jamui, Bihar", "Patna", "Delhi"
      - crop: e.g. "Tomato", "Potato", "Rice", "Wheat", "Corn", "Onion", "Chilli", "Brinjal"
      - lat, lon: optional float coordinates (GPS or Autocomplete selection)
      - user_id: optional user identifier
    """
    try:
        location = request.args.get("location") or request.args.get("city") or request.args.get("q") or "Patna, Bihar"
        crop = request.args.get("crop", "Tomato")
        lat = request.args.get("lat", type=float)
        lon = request.args.get("lon", type=float)
        user_id = request.args.get("user_id")

        risk_data = get_agro_weather_risk(
            location=location,
            crop=crop,
            lat=lat,
            lon=lon,
            user_id=user_id
        )
        return success_response(risk_data, message="Crop-specific agro weather risk evaluated successfully")
    except ValueError as ve:
        return error_response(message=str(ve), code="LOCATION_NOT_FOUND", status_code=404)
    except RuntimeError as re:
        return error_response(message=str(re), code="WEATHER_SERVICE_UNAVAILABLE", status_code=503)
    except Exception as e:
        return error_response(message="Failed to compute weather risk", details=str(e), status_code=500)

@weather_bp.route("/locations", methods=["GET"])
def list_locations():
    """
    Dynamic Location Search & Autocomplete Endpoint: GET /api/weather/locations?q=<query>
    Returns real geocoding matches from Open-Meteo or preset agricultural hubs.
    """
    try:
        query = request.args.get("q") or request.args.get("search") or request.args.get("query")
        results = search_locations(query=query)
        return success_response(results, message="Location suggestions retrieved")
    except Exception as e:
        return error_response("Failed to search locations", details=str(e), status_code=500)

@weather_bp.route("/history", methods=["GET"])
def get_history():
    """
    Returns recent weather check logs.
    Query param: limit (default 10)
    """
    try:
        limit = request.args.get("limit", default=10, type=int)
        history = get_weather_check_history(limit=limit)
        return success_response(history, message="Weather check history retrieved successfully")
    except Exception as e:
        return error_response("Failed to fetch weather check history", details=str(e), status_code=500)

@weather_bp.route("/crops", methods=["GET"])
def list_crops():
    """Returns list of supported crops for weather vulnerability profiling."""
    crops = get_supported_crops()
    return success_response(crops, message="Crop list retrieved")

from flask import Blueprint, request
from services.weather_service import (
    get_agro_weather_risk, 
    get_supported_crops, 
    get_supported_locations,
    get_weather_check_history
)
from utils.helpers import success_response, error_response

weather_bp = Blueprint("weather", __name__, url_prefix="/api/weather")

@weather_bp.route("/risk", methods=["GET"])
def get_weather_risk():
    """
    Primary Endpoint: GET /api/weather/risk
    Parameters:
      - location (or city): e.g. "Patna, Bihar" or "Pune, Maharashtra"
      - crop: e.g. "Tomato", "Potato", "Rice", "Wheat"
      - lat, lon: optional precise coordinates
      - user_id: optional user identifier
    Returns:
      temperature, humidity, rain_chance, weather_condition, risk_level, concern, recommendation
    """
    try:
        location = request.args.get("location") or request.args.get("city") or "Patna, Bihar"
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
    except Exception as e:
        return error_response(message="Failed to compute weather risk", details=str(e), status_code=500)

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

@weather_bp.route("/locations", methods=["GET"])
def list_locations():
    """Returns list of preset agricultural state & city hubs."""
    locations = get_supported_locations()
    return success_response(locations, message="Location list retrieved")

from flask import Blueprint, request
from services.weather_service import get_agro_weather_risk, CROP_PROFILES, CITY_COORDINATES
from utils.helpers import success_response, error_response

weather_bp = Blueprint("weather", __name__, url_prefix="/api/weather")

@weather_bp.route("/risk", methods=["GET"])
def get_weather_risk():
    """
    Get crop-specific weather risk alerts, 7-day spray suitability window,
    and agro-meteorological indices.
    Query params: city, crop, lat, lon
    """
    try:
        city = request.args.get("city", "Pune")
        crop = request.args.get("crop", "Tomato")
        lat = request.args.get("lat", type=float)
        lon = request.args.get("lon", type=float)

        risk_data = get_agro_weather_risk(city=city, crop=crop, lat=lat, lon=lon)
        return success_response(risk_data, message="Agro-weather risk evaluated successfully")
    except Exception as e:
        return error_response(message="Failed to compute weather risk", details=str(e), status_code=500)

@weather_bp.route("/crops", methods=["GET"])
def get_supported_crops():
    """Returns list of supported crops for weather vulnerability profiling."""
    crops = list(CROP_PROFILES.keys())
    return success_response(crops, message="Crop list retrieved")

@weather_bp.route("/locations", methods=["GET"])
def get_locations():
    """Returns list of preset agricultural hubs."""
    locations = [{"id": k, "name": v["name"]} for k, v in CITY_COORDINATES.items() if k != "default"]
    return success_response(locations, message="Location list retrieved")

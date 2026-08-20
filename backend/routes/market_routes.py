from flask import Blueprint, request
from services.market_service import get_all_prices, calculate_mandi_arbitrage
from utils.helpers import success_response, error_response

market_bp = Blueprint("market", __name__, url_prefix="/api/market")

@market_bp.route("/prices", methods=["GET"])
def get_market_prices():
    """
    Get live mandi spot prices, 7-day trend history, and price forecasts.
    Query params: commodity, state, search
    """
    commodity = request.args.get("commodity")
    state = request.args.get("state")
    search = request.args.get("search")

    data = get_all_prices(commodity=commodity, state=state, search=search)
    return success_response(data, message="Market prices retrieved")

@market_bp.route("/arbitrage", methods=["GET"])
def get_arbitrage_analysis():
    """
    Compare mandi prices and compute net margins after logistics costs.
    Query params: commodity, quantity_quintals, transport_cost_per_km
    """
    try:
        commodity = request.args.get("commodity", "Wheat")
        quantity = request.args.get("quantity_quintals", default=50, type=float)
        transport_rate = request.args.get("transport_cost_per_km", default=15, type=float)

        results = calculate_mandi_arbitrage(commodity=commodity, quantity_quintals=quantity, transport_cost_per_km=transport_rate)
        return success_response(results, message="Mandi arbitrage calculated successfully")
    except Exception as e:
        return error_response("Failed to calculate arbitrage", details=str(e), status_code=500)

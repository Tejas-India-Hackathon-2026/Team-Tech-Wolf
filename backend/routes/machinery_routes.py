from flask import Blueprint, request
from services.machinery_service import list_machinery, get_machinery_by_id, create_booking
from utils.helpers import success_response, error_response

machinery_bp = Blueprint("machinery", __name__, url_prefix="/api/machinery")

@machinery_bp.route("/listings", methods=["GET"])
def get_listings():
    """
    Query machinery marketplace with filters.
    Query params: category, max_distance, search
    """
    category = request.args.get("category")
    max_distance = request.args.get("max_distance")
    search = request.args.get("search")

    results = list_machinery(category=category, max_distance=max_distance, search=search)
    return success_response(results, message="Machinery listings retrieved")

@machinery_bp.route("/listings/<machinery_id>", methods=["GET"])
def get_details(machinery_id):
    """Retrieve details for specific equipment."""
    item = get_machinery_by_id(machinery_id)
    if not item:
        return error_response("Equipment not found", status_code=404)
    return success_response(item, message="Equipment details retrieved")

@machinery_bp.route("/book", methods=["POST"])
def book_machinery():
    """
    Submit machinery booking reservation.
    """
    try:
        data = request.get_json() or {}
        if not data.get("machinery_id"):
            return error_response("machinery_id is required", status_code=400)
            
        booking, err = create_booking(data)
        if err:
            return error_response(err, status_code=400)
            
        return success_response(booking, message="Machinery booking confirmed successfully", status_code=201)
    except Exception as e:
        return error_response("Failed to process booking", details=str(e), status_code=500)

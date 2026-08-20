from flask import Blueprint, request
from services.machinery_service import (
    list_machinery, 
    get_machinery_by_id, 
    create_booking, 
    get_all_bookings,
    update_booking_status
)
from utils.helpers import success_response, error_response

machinery_bp = Blueprint("machinery", __name__, url_prefix="/api/machinery")

@machinery_bp.route("", methods=["GET"])
@machinery_bp.route("/listings", methods=["GET"])
def get_machinery_catalog():
    """
    Primary endpoint: GET /api/machinery
    Query params:
      - location: e.g. "Patna, Bihar" or "Pune, Maharashtra"
      - type (or category): Tractor, Harvester, Rotavator, Cultivator, Seed Drill
      - sort: price_asc, price_desc, distance_asc, rating_desc
      - search: keyword search
    """
    location = request.args.get("location")
    machine_type = request.args.get("type") or request.args.get("category")
    sort = request.args.get("sort", "distance_asc")
    search = request.args.get("search")
    max_distance = request.args.get("max_distance")

    results = list_machinery(
        location=location,
        machine_type=machine_type,
        sort=sort,
        max_distance=max_distance,
        search=search
    )
    return success_response(results, message="Machinery marketplace catalog retrieved")

@machinery_bp.route("/<machinery_id>", methods=["GET"])
@machinery_bp.route("/listings/<machinery_id>", methods=["GET"])
def get_machinery_details(machinery_id):
    """Retrieve single machinery details by ID."""
    item = get_machinery_by_id(machinery_id)
    if not item:
        return error_response("Machinery listing not found", status_code=404)
    return success_response(item, message="Machinery details retrieved")

@machinery_bp.route("/bookings", methods=["POST"])
@machinery_bp.route("/book", methods=["POST"])
def submit_booking():
    """
    Primary booking endpoint: POST /api/machinery/bookings
    Validates booking info and calculates estimated cost server-side.
    """
    try:
        data = request.get_json() or {}
        booking, err = create_booking(data)
        if err:
            return error_response(err, status_code=400)
            
        return success_response(booking, message="Machinery booking confirmed successfully", status_code=201)
    except Exception as e:
        return error_response("Failed to process booking", details=str(e), status_code=500)

@machinery_bp.route("/bookings", methods=["GET"])
def list_bookings():
    """
    Returns list of all bookings for 'My Bookings' view: GET /api/machinery/bookings
    """
    try:
        bookings = get_all_bookings()
        return success_response(bookings, message="Bookings list retrieved")
    except Exception as e:
        return error_response("Failed to retrieve bookings", details=str(e), status_code=500)

@machinery_bp.route("/bookings/<booking_id>/status", methods=["PATCH"])
def update_status(booking_id):
    """
    Updates booking status: PATCH /api/machinery/bookings/<id>/status
    Payload: {"status": "Accepted" | "Completed" | "Cancelled" | "Pending"}
    """
    try:
        data = request.get_json() or {}
        new_status = data.get("status")
        if not new_status:
            return error_response("Status field is required", status_code=400)

        success, err = update_booking_status(booking_id, new_status)
        if err:
            return error_response(err, status_code=400)

        return success_response({"id": booking_id, "status": new_status}, message=f"Booking status updated to {new_status}")
    except Exception as e:
        return error_response("Failed to update status", details=str(e), status_code=500)

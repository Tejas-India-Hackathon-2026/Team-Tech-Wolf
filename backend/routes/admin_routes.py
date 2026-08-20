from flask import Blueprint, request
from services.auth_service import get_all_users, toggle_user_status, change_user_role
from services.admin_service import (
    get_admin_dashboard_stats,
    get_admin_machinery_list,
    update_admin_machinery_status,
    delete_admin_machinery,
    get_admin_bookings_list,
    get_admin_activity_logs,
    get_admin_market_overview
)
from utils.helpers import success_response, error_response

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/stats", methods=["GET"])
def get_stats():
    """GET /api/admin/stats: Returns platform-wide aggregation metrics."""
    try:
        stats = get_admin_dashboard_stats()
        return success_response(stats, message="Admin statistics retrieved")
    except Exception as e:
        return error_response("Failed to retrieve platform stats", details=str(e), status_code=500)

@admin_bp.route("/users", methods=["GET"])
def list_users():
    """GET /api/admin/users: Returns list of all registered demo users."""
    try:
        users = get_all_users()
        return success_response(users, message="User list retrieved")
    except Exception as e:
        return error_response("Failed to retrieve users", details=str(e), status_code=500)

@admin_bp.route("/users/<user_id>/status", methods=["PATCH"])
def toggle_status(user_id):
    """PATCH /api/admin/users/<id>/status: Toggles Active / Disabled status."""
    try:
        updated, err = toggle_user_status(user_id)
        if err:
            return error_response(err, status_code=400)
        return success_response(updated, message="User status updated successfully")
    except Exception as e:
        return error_response("Failed to update user status", details=str(e), status_code=500)

@admin_bp.route("/users/<user_id>/role", methods=["PATCH"])
def update_role(user_id):
    """PATCH /api/admin/users/<id>/role: Toggles Farmer <-> Machinery Owner."""
    try:
        data = request.get_json() or {}
        new_role = data.get("role") or data.get("user_type")
        if not new_role:
            return error_response("Role field is required", status_code=400)

        updated, err = change_user_role(user_id, new_role)
        if err:
            return error_response(err, status_code=400)
        return success_response(updated, message=f"User role updated to {new_role}")
    except Exception as e:
        return error_response("Failed to update user role", details=str(e), status_code=500)

@admin_bp.route("/machinery", methods=["GET"])
def list_machinery():
    """GET /api/admin/machinery: Returns machinery catalog for admin moderation."""
    try:
        listings = get_admin_machinery_list()
        return success_response(listings, message="Admin machinery list retrieved")
    except Exception as e:
        return error_response("Failed to retrieve machinery", details=str(e), status_code=500)

@admin_bp.route("/machinery/<machinery_id>/status", methods=["PATCH"])
def update_machinery_status_route(machinery_id):
    """PATCH /api/admin/machinery/<id>/status: Updates listing availability/approval."""
    try:
        data = request.get_json() or {}
        new_status = data.get("status") or data.get("availability")
        if not new_status:
            return error_response("Status field is required", status_code=400)

        updated, err = update_admin_machinery_status(machinery_id, new_status)
        if err:
            return error_response(err, status_code=400)
        return success_response(updated, message=f"Machinery status updated to {new_status}")
    except Exception as e:
        return error_response("Failed to update machinery status", details=str(e), status_code=500)

@admin_bp.route("/machinery/<machinery_id>", methods=["DELETE"])
def delete_machinery_route(machinery_id):
    """DELETE /api/admin/machinery/<id>: Removes listing."""
    try:
        removed, err = delete_admin_machinery(machinery_id)
        if err:
            return error_response(err, status_code=400)
        return success_response(removed, message="Machinery listing removed successfully")
    except Exception as e:
        return error_response("Failed to remove machinery", details=str(e), status_code=500)

@admin_bp.route("/bookings", methods=["GET"])
def list_bookings():
    """GET /api/admin/bookings: Returns all platform bookings."""
    try:
        bookings = get_admin_bookings_list()
        return success_response(bookings, message="Admin bookings retrieved")
    except Exception as e:
        return error_response("Failed to retrieve bookings", details=str(e), status_code=500)

@admin_bp.route("/activity", methods=["GET"])
def get_activity():
    """GET /api/admin/activity: Returns disease scans and weather check logs."""
    try:
        logs = get_admin_activity_logs()
        return success_response(logs, message="Activity logs retrieved")
    except Exception as e:
        return error_response("Failed to retrieve activity logs", details=str(e), status_code=500)

@admin_bp.route("/market", methods=["GET"])
def get_market():
    """GET /api/admin/market: Returns market data overview."""
    try:
        overview = get_admin_market_overview()
        return success_response(overview, message="Market data overview retrieved")
    except Exception as e:
        return error_response("Failed to retrieve market data", details=str(e), status_code=500)

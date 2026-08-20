from flask import Blueprint, request
from services.auth_service import (
    register_user, 
    authenticate_user, 
    get_user_by_token, 
    logout_token
)
from utils.helpers import success_response, error_response

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    POST /api/auth/register
    Payload: { name, phone, email, password, user_type, state, district }
    """
    try:
        data = request.get_json() or {}
        session_data, err = register_user(data)
        if err:
            return error_response(err, code="REGISTRATION_FAILED", status_code=400)

        return success_response(session_data, message="Registration successful", status_code=201)
    except Exception as e:
        return error_response("An unexpected error occurred during registration", details=str(e), status_code=500)

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Payload: { identifier: (phone or email), password }
    """
    try:
        data = request.get_json() or {}
        identifier = data.get("identifier") or data.get("email") or data.get("phone") or data.get("mobileNumber")
        password = data.get("password")

        session_data, err = authenticate_user(identifier, password)
        if err:
            return error_response(err, code="AUTH_FAILED", status_code=401)

        return success_response(session_data, message="Login successful", status_code=200)
    except Exception as e:
        return error_response("An unexpected error occurred during login", details=str(e), status_code=500)

@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    """
    GET /api/auth/me
    Header: Authorization: Bearer <token>
    """
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "").strip() if auth_header else request.args.get("token")

        user, err = get_user_by_token(token)
        if err:
            return error_response(err, code="UNAUTHORIZED", status_code=401)

        return success_response({"user": user}, message="User session valid")
    except Exception as e:
        return error_response("Failed to authenticate session", details=str(e), status_code=500)

@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    POST /api/auth/logout
    Header: Authorization: Bearer <token>
    """
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "").strip() if auth_header else None
        if token:
            logout_token(token)
        return success_response(None, message="Logged out successfully")
    except Exception as e:
        return error_response("Failed to logout cleanly", details=str(e), status_code=500)

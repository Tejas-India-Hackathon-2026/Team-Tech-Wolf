from flask import jsonify

def success_response(data, message="Success", status_code=200):
    """
    Standardized API Success Response
    """
    return jsonify({
        "success": True,
        "status": "success",
        "message": message,
        "data": data
    }), status_code

def error_response(message="An error occurred", code="API_ERROR", status_code=400, details=None):
    """
    Standardized API Error Response
    Does not expose Python stack traces in production responses.
    """
    payload = {
        "success": False,
        "status": "error",
        "error": {
            "code": code,
            "message": message
        }
    }
    if details and isinstance(details, str) and not details.startswith("Traceback"):
        payload["error"]["details"] = details
    return jsonify(payload), status_code

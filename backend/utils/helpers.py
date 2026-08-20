from flask import jsonify

def success_response(data, message="Success", status_code=200):
    return jsonify({
        "status": "success",
        "message": message,
        "data": data
    }), status_code

def error_response(message="An error occurred", status_code=400, details=None):
    payload = {
        "status": "error",
        "message": message
    }
    if details:
        payload["details"] = details
    return jsonify(payload), status_code

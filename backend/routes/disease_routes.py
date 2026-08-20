from flask import Blueprint, request
from services.disease_service import (
    analyze_crop_disease, 
    validate_image_file, 
    get_supported_crops, 
    get_scan_history,
    CROP_DISEASE_PROFILES
)
from utils.helpers import success_response, error_response

disease_bp = Blueprint("disease", __name__, url_prefix="/api/disease")

@disease_bp.route("/analyze", methods=["POST"])
def analyze_crop():
    """
    Primary endpoint: POST /api/disease/analyze
    Accepts multipart/form-data with 'image' file and 'crop' form field.
    Validates file type and size, analyzes crop leaf pathology, and returns structured JSON.
    """
    try:
        # Check if multipart/form-data contains image file
        image_file = None
        crop = "Tomato"
        user_id = None
        filename = "uploaded_leaf.jpg"

        if request.content_type and "multipart/form-data" in request.content_type:
            if "image" not in request.files:
                return error_response("No image file provided in 'image' field.", status_code=400)
            
            image_file = request.files["image"]
            is_valid, validation_error = validate_image_file(image_file)
            if not is_valid:
                return error_response(validation_error, status_code=400)

            crop = request.form.get("crop", "Tomato")
            user_id = request.form.get("user_id")
            filename = image_file.filename

        elif request.is_json:
            data = request.get_json() or {}
            crop = data.get("crop", "Tomato")
            user_id = data.get("user_id")
            filename = data.get("filename", "sample_leaf.jpg")
        else:
            # Check if image was sent as raw data
            if "image" in request.files:
                image_file = request.files["image"]
                is_valid, validation_error = validate_image_file(image_file)
                if not is_valid:
                    return error_response(validation_error, status_code=400)
                filename = image_file.filename
            crop = request.form.get("crop", "Tomato") if request.form else "Tomato"

        result = analyze_crop_disease(
            image_file=image_file,
            crop_name=crop,
            user_id=user_id,
            filename=filename
        )
        return success_response(result, message="Crop analysis completed successfully")

    except Exception as e:
        return error_response(message="Failed to analyze crop image", details=str(e), status_code=500)

@disease_bp.route("/diagnose", methods=["POST"])
def diagnose_crop_alias():
    """Backwards-compatible alias for /analyze."""
    return analyze_crop()

@disease_bp.route("/history", methods=["GET"])
def get_history():
    """
    Returns recent crop disease scan history for the farmer.
    Query param: limit (default 10)
    """
    try:
        limit = request.args.get("limit", default=10, type=int)
        history = get_scan_history(limit=limit)
        return success_response(history, message="Scan history retrieved successfully")
    except Exception as e:
        return error_response("Failed to fetch scan history", details=str(e), status_code=500)

@disease_bp.route("/crops", methods=["GET"])
def list_crops():
    """Returns all supported crops for pathology diagnosis."""
    crops = get_supported_crops()
    return success_response(crops, message="Supported crops fetched")

@disease_bp.route("/library", methods=["GET"])
def get_library():
    """Returns complete reference library of diseases, symptoms, and treatments."""
    return success_response(CROP_DISEASE_PROFILES, message="Disease library retrieved")

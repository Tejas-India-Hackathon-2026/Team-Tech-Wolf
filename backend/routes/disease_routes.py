from flask import Blueprint, request
from services.disease_service import (
    analyze_crop_disease, 
    validate_image_file, 
    get_supported_crops, 
    get_scan_history,
    get_crop_scenarios,
    CROP_DISEASE_PROFILES
)
from utils.helpers import success_response, error_response

disease_bp = Blueprint("disease", __name__, url_prefix="/api/disease")

@disease_bp.route("/analyze", methods=["POST"])
def analyze_crop():
    """
    Primary endpoint: POST /api/disease/analyze
    Accepts multipart/form-data with 'image' file and 'crop' form field.
    Validates crop selection, image presence, file format, and size.
    Returns structured JSON with crop-specific pathology intelligence.
    """
    try:
        image_file = None
        crop = None
        user_id = None
        filename = "uploaded_leaf.jpg"
        scenario_id = None

        if request.content_type and "multipart/form-data" in request.content_type:
            # 1. Validate Crop Selection in Form Data
            crop = request.form.get("crop")
            if not crop or not str(crop).strip() or str(crop).strip().lower() in {'null', 'undefined', ''}:
                return error_response("Please select a crop before analysis.", code="MISSING_CROP", status_code=400)
            
            crop = crop.strip()
            user_id = request.form.get("user_id")
            scenario_id = request.form.get("scenario_id") or request.form.get("scenario")

            # 2. Validate Image File in Form Data
            if "image" not in request.files:
                return error_response("Please upload a crop/leaf image.", code="MISSING_IMAGE", status_code=400)
            
            image_file = request.files["image"]
            if not image_file or not image_file.filename or image_file.filename.strip() == "":
                return error_response("Please upload a crop/leaf image.", code="MISSING_IMAGE", status_code=400)

            is_valid, validation_error = validate_image_file(image_file)
            if not is_valid:
                return error_response(validation_error, code="INVALID_IMAGE", status_code=400)

            filename = image_file.filename

        elif request.is_json:
            data = request.get_json() or {}
            crop = data.get("crop")
            if not crop or not str(crop).strip() or str(crop).strip().lower() in {'null', 'undefined', ''}:
                return error_response("Please select a crop before analysis.", code="MISSING_CROP", status_code=400)
            
            crop = crop.strip()
            user_id = data.get("user_id")
            scenario_id = data.get("scenario_id") or data.get("scenario")
            filename = data.get("filename")

            if not filename and "image" not in data and "image_base64" not in data:
                return error_response("Please upload a crop/leaf image.", code="MISSING_IMAGE", status_code=400)
            
            if not filename:
                filename = f"{crop.lower()}_sample_leaf.jpg"

        else:
            # Fallback form data
            crop = request.form.get("crop") if request.form else None
            if not crop or not str(crop).strip() or str(crop).strip().lower() in {'null', 'undefined', ''}:
                return error_response("Please select a crop before analysis.", code="MISSING_CROP", status_code=400)
            
            crop = crop.strip()
            scenario_id = request.form.get("scenario_id") or request.form.get("scenario") if request.form else None

            if "image" in request.files:
                image_file = request.files["image"]
                is_valid, validation_error = validate_image_file(image_file)
                if not is_valid:
                    return error_response(validation_error, code="INVALID_IMAGE", status_code=400)
                filename = image_file.filename
            else:
                return error_response("Please upload a crop/leaf image.", code="MISSING_IMAGE", status_code=400)

        result = analyze_crop_disease(
            image_file=image_file,
            crop_name=crop,
            user_id=user_id,
            filename=filename,
            scenario_id=scenario_id
        )
        return success_response(result, message="Crop analysis completed successfully")

    except ValueError as ve:
        return error_response(message=str(ve), code="VALIDATION_ERROR", status_code=400)
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

@disease_bp.route("/scenarios", methods=["GET"])
def list_scenarios():
    """Returns available crop-specific demo scenarios."""
    crop = request.args.get("crop")
    scenarios = get_crop_scenarios(crop_name=crop)
    return success_response(scenarios, message="Demo scenarios fetched")

@disease_bp.route("/library", methods=["GET"])
def get_library():
    """Returns complete reference library of diseases, symptoms, and treatments."""
    return success_response(CROP_DISEASE_PROFILES, message="Disease library retrieved")

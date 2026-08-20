from flask import Blueprint, request
from services.disease_service import analyze_crop_image, get_supported_crops, DISEASE_KNOWLEDGE_BASE
from utils.helpers import success_response, error_response

disease_bp = Blueprint("disease", __name__, url_prefix="/api/disease")

@disease_bp.route("/diagnose", methods=["POST"])
def diagnose_crop():
    """
    Diagnose crop disease from uploaded image and crop selector.
    Supports multipart/form-data with file or JSON with metadata.
    """
    try:
        crop = "Tomato"
        filename = "uploaded_leaf.jpg"
        
        if request.content_type and "multipart/form-data" in request.content_type:
            if "image" in request.files:
                file = request.files["image"]
                filename = file.filename
            crop = request.form.get("crop", "Tomato")
        elif request.is_json:
            data = request.get_json() or {}
            crop = data.get("crop", "Tomato")
            filename = data.get("filename", "sample_leaf.jpg")

        result = analyze_crop_image(crop_name=crop, filename=filename)
        return success_response(result, message="Diagnosis completed successfully")
    except Exception as e:
        return error_response(message="Failed to analyze crop image", details=str(e), status_code=500)

@disease_bp.route("/crops", methods=["GET"])
def list_crops():
    """Returns all supported crops for pathology diagnosis."""
    crops = get_supported_crops()
    return success_response(crops, message="Supported crops fetched")

@disease_bp.route("/library", methods=["GET"])
def get_library():
    """Returns complete reference library of diseases, symptoms, and treatments."""
    return success_response(DISEASE_KNOWLEDGE_BASE, message="Disease library retrieved")

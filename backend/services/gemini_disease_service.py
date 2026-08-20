"""
Gemini Multimodal Crop Disease Detection & Visual Pathology Service
Strict multi-stage pipeline:
1. Plant Image Verification (HARD GATE: blocks non-plant images immediately)
2. Image Quality Assessment (blocks blurry/dark images)
3. Crop Identification (blocks uncertain crops with CROP_UNCERTAIN; no default Tomato)
4. Crop Mismatch Detection (validates against manual selection)
5. Pathology & Health Evaluation (supports healthy crops and accurate diagnostics)
"""
import os
import json
import base64
import time
import uuid
import requests
from services.disease_service import analyze_crop_disease, CROP_DISEASE_PROFILES
from models import supabase_client

PRIMARY_GEMINI_MODEL = "gemini-2.5-flash"
FALLBACK_GEMINI_MODELS = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3.5-flash"]

GEMINI_PROMPT = """You are an expert Botanical & Agricultural Crop Pathology AI Assistant.
Inspect the uploaded image carefully in sequential steps and return a valid JSON object matching the schema below.

ANALYSIS INSTRUCTIONS:
1. STEP 1 - Plant Verification (CRITICAL HARD GATE):
   Determine if this image clearly contains a real plant, crop, leaf, stem, fruit, vegetable, flower, or agricultural foliage.
   If the image is NOT a plant (e.g., person, face, human body, laptop, computer screen, phone, bottle, cup, vehicle, car, room, wall, animal, document, screenshot, or unrelated object):
     "is_plant": false,
     "is_plant_image": false,
     "plant_relevance": "non_plant",
     "image_quality": "good",
     "detected_crop": null,
     "crop_confidence": "none",
     "plant_status": "non_plant",
     "possible_disease": null,
     "severity": "none",
     "visible_signs": [],
     "recommended_actions": [],
     "prevention": [],
     "hindi_explanation": "",
     "uncertainty_note": "Non-plant image detected."
   STOP - Do NOT guess any crop, and do NOT fabricate any disease!

2. STEP 2 - Image Quality Assessment:
   Is the image clear and close enough to inspect foliage?
   If it is too blurry, extremely dark, overexposed, distant, or mostly background:
     "is_plant": true,
     "is_plant_image": true,
     "plant_relevance": "crop",
     "image_quality": "unclear",
     "detected_crop": null,
     "crop_confidence": "low",
     "plant_status": "uncertain",
     "possible_disease": null,
     "severity": "unknown"

3. STEP 3 - Crop Identification:
   If is_plant_image is true and image_quality is good:
   Identify the specific agricultural crop or plant species (e.g. Maize/Corn, Tomato, Potato, Rice, Wheat, Cotton, Chilli, Onion, Brinjal, Soybean, Sugarcane, Mustard, etc.).
   - "detected_crop": "<Exact Crop Name>" or null if species cannot be identified
   - "crop_confidence": "high" | "medium" | "low" | "none"
   - "plant_relevance": "crop" | "ornamental" | "wild"

4. STEP 4 - Crop Consistency Check:
   User selected: "{selected_crop}".
   - If selected_crop is "auto" or matches detected_crop: "crop_match": true
   - If user selected e.g. "Tomato" but image is clearly "Maize" or "Potato" or "Rice":
     "crop_match": false
     "mismatch_message": "The uploaded image appears to be " + detected_crop + ", but " + selected_crop + " was selected."

5. STEP 5 - Health & Pathology Analysis:
   Inspect foliage for fungal lesions, blights, rusts, powdery mildew, bacterial spots, viral curling, pest damage, or nutrient stress.
   - If healthy without obvious disease signs:
     "plant_status": "healthy",
     "possible_disease": null,
     "severity": "none",
     "recommended_actions": ["Continue balanced fertigation and regular field scouting."]
   - If disease/pest/stress is observed:
     "plant_status": "disease_suspected",
     "possible_disease": "<Specific Disease Name>",
     "scientific_name": "<Causal Organism or Scientific Name>",
     "severity": "low" | "moderate" | "high",
     "visible_signs": [2-4 specific visual symptoms],
     "recommended_actions": [2-4 actionable treatments with generic dosages],
     "prevention": [2-3 preventive farming practices],
     "hindi_explanation": "<1-2 sentence summary in simple Hindi>",
     "uncertainty_note": "Visual inspection is preliminary. Consult local agronomist for confirmation."

JSON OUTPUT FORMAT:
{{
  "is_plant": true,
  "is_plant_image": true,
  "plant_relevance": "crop",
  "image_quality": "good",
  "detected_crop": "Rice",
  "crop_confidence": "high",
  "crop_match": true,
  "mismatch_message": null,
  "plant_status": "disease_suspected",
  "possible_disease": "Rice Leaf Blast",
  "scientific_name": "Magnaporthe oryzae",
  "severity": "high",
  "visible_signs": ["Spindle-shaped lesions with brown margins"],
  "recommended_actions": ["Apply Tricyclazole 75% WP @ 0.6g/L", "Avoid excessive nitrogen top-dressing"],
  "prevention": ["Treat nursery seeds with bio-fungicide"],
  "hindi_explanation": "धान की पत्तियों पर झोंका (ब्लास्ट) रोग के लक्षण हैं। ट्राईसाइक्लाजोल का छिड़काव करें।",
  "uncertainty_note": "Visual symptoms can overlap with other foliar stresses."
}}
"""

def is_gemini_configured() -> bool:
    """Checks whether GEMINI_API_KEY is present in environment."""
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    return bool(key and len(key) > 5 and not key.startswith("your-"))

def analyze_crop_image_with_gemini(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    selected_crop: str = "auto",
    user_id: str = None,
    scenario_id: str = None,
    filename: str = "leaf.jpg",
    allow_demo: bool = False
) -> dict:
    """
    Primary image analysis dispatcher.
    Enforces strict hard-gated verification:
    1. Rejects non-plant images with NON_PLANT_IMAGE.
    2. Rejects unclear images with IMAGE_UNCLEAR.
    3. Rejects uncertain crops with CROP_UNCERTAIN (NEVER defaults to Tomato).
    4. Detects crop mismatches with CROP_MISMATCH.
    5. Returns descriptive error upon Gemini API failure (never silently returns demo Tomato).
    """
    clean_crop = str(selected_crop or "auto").strip()
    if clean_crop.lower() in {"auto", "auto detect crop", "auto detect", "autodetect", "null", "undefined", ""}:
        clean_crop = "auto"

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()

    # If Gemini is configured, run real multimodal vision model
    if is_gemini_configured():
        try:
            print("[Disease] Calling Gemini service")
            gemini_result = _call_gemini_api(api_key, image_bytes, mime_type, clean_crop)
            print("[Disease] Gemini response received")
            if gemini_result:
                formatted = _format_gemini_response(gemini_result, clean_crop, user_id, filename)
                if formatted.get("success") and user_id:
                    _persist_scan_record(formatted, user_id)
                return formatted
            else:
                print("[GeminiDiseaseService] Gemini response parse failed")
                return {
                    "success": False,
                    "error_code": "AI_RESPONSE_INVALID",
                    "message": "The AI response could not be validated. Please try again."
                }
        except Exception as e:
            err_msg = str(e)
            print(f"[GeminiDiseaseService] Gemini API call error: {err_msg}")
            # Do NOT silently substitute demo Tomato! Return clear error with backend reason
            return {
                "success": False,
                "error_code": "AI_SERVICE_UNAVAILABLE",
                "message": f"AI service error: {err_msg}"
            }

    # If Gemini is NOT configured, only provide demo if explicitly requested with scenario_id
    if scenario_id:
        print(f"[GeminiDiseaseService] Explicit demo scenario requested: {scenario_id}")
        demo_res = _generate_explicit_demo_scenario(clean_crop, image_bytes, scenario_id, user_id, filename)
        return demo_res

    print("[GeminiDiseaseService] Gemini API is not configured")
    return {
        "success": False,
        "error_code": "AI_SERVICE_NOT_CONFIGURED",
        "message": "Gemini AI disease detection service is not configured. Please configure GEMINI_API_KEY in backend/.env."
    }


def _call_gemini_api(api_key: str, image_bytes: bytes, mime_type: str, selected_crop: str) -> dict:
    """
    Executes REST call to Gemini multimodal endpoint with fallback models.
    """
    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    formatted_prompt = GEMINI_PROMPT.format(selected_crop=selected_crop)

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "inline_data": {
                            "mime_type": mime_type or "image/jpeg",
                            "data": b64_image
                        }
                    },
                    {
                        "text": formatted_prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "response_mime_type": "application/json"
        }
    }

    headers = {
        "x-goog-api-key": api_key,
        "Content-Type": "application/json"
    }

    models_to_try = [PRIMARY_GEMINI_MODEL] + [m for m in FALLBACK_GEMINI_MODELS if m != PRIMARY_GEMINI_MODEL]
    last_error = None

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=25)
            if response.status_code == 200:
                resp_json = response.json()
                candidates = resp_json.get("candidates", [])
                if candidates:
                    content_parts = candidates[0].get("content", {}).get("parts", [])
                    if content_parts:
                        raw_text = content_parts[0].get("text", "").strip()
                        if raw_text.startswith("```json"):
                            raw_text = raw_text[7:]
                        if raw_text.startswith("```"):
                            raw_text = raw_text[3:]
                        if raw_text.endswith("```"):
                            raw_text = raw_text[:-3]
                        return json.loads(raw_text.strip())
            else:
                last_error = f"Model {model} returned HTTP {response.status_code}: {response.text[:180]}"
                # If 403 or 400 (auth error), don't keep polling other models endlessly
                if response.status_code in {400, 401, 403}:
                    try:
                        err_detail = response.json().get("error", {}).get("message", response.text[:150])
                        raise RuntimeError(f"Gemini API authentication/access error ({response.status_code}): {err_detail}")
                    except Exception as parse_err:
                        if isinstance(parse_err, RuntimeError):
                            raise parse_err
                        raise RuntimeError(f"Gemini API authentication error ({response.status_code}): {response.text[:150]}")
        except requests.RequestException as req_err:
            last_error = str(req_err)

    raise RuntimeError(last_error or "Gemini API request failed across all candidate models.")


def _format_gemini_response(data: dict, selected_crop: str, user_id: str, filename: str) -> dict:
    """
    Strict validation and schema transformation:
    1. HARD GATE: Non-plant image check
    2. HARD GATE: Image quality check
    3. HARD GATE: Crop identification check
    4. HARD GATE: Crop mismatch check
    5. Health / Pathology formatting
    """
    if not isinstance(data, dict):
        return {
            "success": False,
            "error_code": "AI_RESPONSE_INVALID",
            "message": "The AI response format was invalid."
        }

    is_plant = data.get("is_plant", data.get("is_plant_image", False))
    plant_relevance = str(data.get("plant_relevance", "")).lower()

    # =========================================================================
    # STEP 1: HARD GATE — Plant Verification
    # =========================================================================
    if is_plant is not True or plant_relevance == "non_plant":
        print("[GeminiDiseaseService] Gemini plant validation result: non_plant")
        return {
            "success": False,
            "is_plant": False,
            "is_plant_image": False,
            "error_code": "NON_PLANT_IMAGE",
            "message": "This image does not appear to contain a plant or crop. Please upload a clear photo of a real plant or leaf.",
            "sub_message": "Please upload a clear photo of a leaf, stem, fruit, crop or affected plant area.",
            "tip": "Tip: Use good lighting and keep the plant clearly visible.",
            "analysis_source": "gemini",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

    print("[GeminiDiseaseService] Gemini plant validation result: plant_confirmed")

    # =========================================================================
    # STEP 2: HARD GATE — Image Quality Check
    # =========================================================================
    image_quality = str(data.get("image_quality", "good")).lower()
    if image_quality in {"unclear", "poor", "blurry", "dark"}:
        print("[GeminiDiseaseService] Gemini image quality result: unclear")
        return {
            "success": False,
            "is_plant": True,
            "is_plant_image": True,
            "image_quality": "unclear",
            "error_code": "IMAGE_UNCLEAR",
            "message": "Unable to clearly analyze this image. Please upload a sharper close-up of the plant.",
            "analysis_source": "gemini",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

    # =========================================================================
    # STEP 3: Crop Identification & Auto Detect Logic
    # =========================================================================
    raw_detected_crop = data.get("detected_crop")
    crop_conf = str(data.get("crop_confidence", "medium")).lower()

    clean_detected_crop = str(raw_detected_crop or "").strip()
    if clean_detected_crop.lower() in {"none", "null", "unknown", "uncertain", "n/a", "crop", "plant", ""}:
        clean_detected_crop = None

    if selected_crop == "auto":
        # Auto detect requires identifiable crop with medium or high confidence
        if not clean_detected_crop or crop_conf in {"low", "none"}:
            print("[GeminiDiseaseService] Gemini crop identification: uncertain")
            return {
                "success": False,
                "is_plant": True,
                "is_plant_image": True,
                "image_quality": "good",
                "error_code": "CROP_UNCERTAIN",
                "message": "The crop could not be identified confidently. Please select the crop manually or upload a clearer image.",
                "analysis_source": "gemini",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
        effective_crop = clean_detected_crop
    else:
        # Manual crop selection provided
        effective_crop = selected_crop

    print(f"[GeminiDiseaseService] Gemini crop identification: {effective_crop} (confidence: {crop_conf})")

    # =========================================================================
    # STEP 4: Crop Consistency & Mismatch Check
    # =========================================================================
    crop_match = data.get("crop_match", True)
    if selected_crop != "auto" and clean_detected_crop and crop_conf in {"high", "medium"}:
        if clean_detected_crop.lower() != selected_crop.lower():
            crop_match = False

    if selected_crop != "auto" and not crop_match:
        print(f"[GeminiDiseaseService] Gemini crop mismatch: selected {selected_crop} vs detected {clean_detected_crop}")
        return {
            "success": False,
            "is_plant": True,
            "is_plant_image": True,
            "crop_match": False,
            "selected_crop": selected_crop,
            "detected_crop": clean_detected_crop or "Different Crop",
            "error_code": "CROP_MISMATCH",
            "message": f"The uploaded image appears to be {clean_detected_crop}, but {selected_crop} was selected. Please verify the crop or use Auto Detect Crop.",
            "mismatch_warning": f"You selected {selected_crop}, but this image appears to be {clean_detected_crop}.",
            "analysis_source": "gemini",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

    # =========================================================================
    # STEP 5: Health & Disease Pathology Formatting
    # =========================================================================
    plant_status = str(data.get("plant_status", "disease_suspected")).lower()
    
    if plant_status == "healthy":
        possible_disease = "Healthy / No obvious disease symptoms visible"
        severity = "None"
    else:
        possible_disease = data.get("possible_disease") or f"{effective_crop} Foliar Condition"
        raw_sev = str(data.get("severity", "moderate")).capitalize()
        severity = raw_sev if raw_sev in {"Low", "Moderate", "High", "Severe", "None"} else "Moderate"

    now_iso = time.strftime("%Y-%m-%d %H:%M:%S")
    scan_id = f"scn-gemini-{uuid.uuid4().hex[:8]}"

    visible_signs = data.get("visible_signs") or []
    if not isinstance(visible_signs, list):
        visible_signs = [str(visible_signs)]

    recommended_actions = data.get("recommended_actions") or []
    if not isinstance(recommended_actions, list):
        recommended_actions = [str(recommended_actions)]

    prevention = data.get("prevention") or []
    if not isinstance(prevention, list):
        prevention = [str(prevention)]

    return {
        "id": scan_id,
        "success": True,
        "is_plant": True,
        "is_plant_image": True,
        "image_quality": "good",
        "analysis_source": "gemini",
        "demo_mode": False,
        "selected_crop": selected_crop,
        "detected_crop": clean_detected_crop or effective_crop,
        "crop_name": clean_detected_crop or effective_crop,
        "crop_match": True,
        "mismatch_warning": None,
        "plant_status": plant_status,
        "detected_disease": possible_disease,
        "disease": possible_disease,
        "scientific_name": data.get("scientific_name", "Plantae"),
        "confidence": 0.90 if crop_conf == "high" else (0.75 if crop_conf == "medium" else 0.60),
        "confidence_level": f"{crop_conf.capitalize()} visual likelihood" if crop_conf in {"high", "medium"} else "Visual inspection",
        "severity": severity,
        "visible_signs": visible_signs,
        "symptoms": visible_signs,
        "recommended_actions": recommended_actions,
        "advice": recommended_actions,
        "prevention": prevention,
        "hindi_explanation": data.get("hindi_explanation", ""),
        "regional_explanation": data.get("hindi_explanation", ""),
        "uncertainty_note": data.get("uncertainty_note", "Visual symptoms can overlap between diseases and nutritional stresses. Consult agricultural experts before major chemical application."),
        "safety_disclaimer": "AI provides preliminary visual decision support only — not a guaranteed diagnosis. Consult local agricultural extension experts for confirmation.",
        "filename": filename,
        "timestamp": now_iso
    }


def _generate_explicit_demo_scenario(
    selected_crop: str, 
    image_bytes: bytes, 
    scenario_id: str, 
    user_id: str, 
    filename: str
) -> dict:
    """
    Explicit demo scenario execution when user specifically picks a sample scenario.
    Always clearly labeled as demo mode.
    """
    clean_crop = selected_crop if selected_crop != "auto" else "Tomato"
    
    demo_base = analyze_crop_disease(
        image_file=None,
        crop_name=clean_crop,
        user_id=user_id,
        filename=filename,
        scenario_id=scenario_id
    )
    
    demo_base["success"] = True
    demo_base["analysis_source"] = "demo"
    demo_base["demo_mode"] = True
    demo_base["demo_label"] = "Demo Analysis"
    demo_base["demo_disclaimer"] = "Prototype demonstration — reference pathology scenario."
    demo_base["selected_crop"] = selected_crop
    demo_base["detected_crop"] = clean_crop
    demo_base["crop_match"] = True
    demo_base["is_plant"] = True
    demo_base["is_plant_image"] = True
    demo_base["image_quality"] = "good"
    demo_base["confidence_level"] = "Demo Reference"
    
    return demo_base


def _persist_scan_record(record: dict, user_id: str = None):
    """
    Persists scan in memory / Supabase history store.
    """
    try:
        supabase_client.from_("disease_scans").insert({
            "id": record.get("id") or f"scn-{int(time.time())}",
            "user_id": user_id or "usr-demo-farmer-01",
            "crop": record.get("detected_crop") or record.get("crop_name") or "Crop",
            "crop_name": record.get("detected_crop") or record.get("crop_name") or "Crop",
            "disease": record.get("detected_disease") or record.get("disease") or "Foliar Analysis",
            "detected_disease": record.get("detected_disease") or record.get("disease") or "Foliar Analysis",
            "severity": record.get("severity", "Moderate"),
            "analysis_source": record.get("analysis_source", "gemini"),
            "created_at": record.get("timestamp") or time.strftime("%Y-%m-%d %H:%M:%S")
        }).execute()
    except Exception:
        pass

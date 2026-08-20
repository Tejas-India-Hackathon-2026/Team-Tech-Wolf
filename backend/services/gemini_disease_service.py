"""
Gemini Multimodal Crop Disease Detection & Visual Pathology Service
Calls Google Gemini multimodal API from the Flask backend to analyze uploaded crop leaves,
detect crop species (Auto Detect Crop), reject non-plant images, flag crop mismatches,
identify healthy foliage, and provide structured agronomic recommendations with Hindi summaries.
"""
import os
import json
import base64
import time
import uuid
import requests
from services.disease_service import analyze_crop_disease, CROP_DISEASE_PROFILES
from models import supabase_client

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

GEMINI_PROMPT = """You are an expert Agronomist and Crop Pathology AI Assistant.
Analyze this uploaded image carefully and return a valid JSON object matching the schema below.

ANALYSIS INSTRUCTIONS:
1. STEP 1 - Plant Verification:
   Determine if this image contains a real plant, crop, leaf, stem, fruit, vegetable, or agricultural foliage.
   If the image is NOT a plant (e.g., person, face, laptop, phone, bottle, car, building, wall, animal, document, screenshot, or unrelated object):
   Set "is_plant_image": false, "plant_status": "non_plant", "error_code": "NON_PLANT_IMAGE", "message": "This image does not appear to contain a crop or plant. Please upload a clear image of the affected plant, leaf, stem, fruit, or crop."

2. STEP 2 - Image Quality:
   Evaluate if the image is sharp and well-lit.
   If it is too blurry, dark, obstructed, or distant to inspect:
   Set "image_quality": "unclear", "error_code": "IMAGE_UNCLEAR", "message": "Unable to clearly analyze this image. Please upload a sharper, well-lit close-up of the affected crop."

3. STEP 3 - Crop Identification:
   Identify the likely crop/plant species (e.g., Tomato, Potato, Rice, Wheat, Cotton, Corn, Chilli, Onion, Brinjal, Soybean, Sugarcane, Mustard, etc.).
   Set "detected_crop": "<Crop Name>".

4. STEP 4 - Crop Consistency Check:
   The user selected: "{selected_crop}".
   If selected_crop is "auto" or matches the detected crop (or general family):
     Set "crop_match": true
   Else if user manually specified a crop that strongly conflicts with what is in the photo (e.g., user selected 'Tomato' but photo is clearly 'Potato' or 'Rice'):
     Set "crop_match": false
     Set "mismatch_message": "You selected {selected_crop}, but this image appears to be " + detected_crop + ". Please verify the crop or switch to Auto Detect."

5. STEP 5 - Health & Pathology Analysis:
   Inspect for foliar diseases, fungal leaf spots, blights, rusts, powdery mildew, bacterial lesions, viral curling, pest damage, or nutrient deficiencies.
   - If the crop looks healthy and free of obvious disease:
     "plant_status": "healthy", "possible_disease": null, "severity": "None", "recommended_actions": ["Continue regular monitoring and follow balanced fertigation practices.", "Maintain good field drainage and weed management."]
   - If symptoms are observed:
     "plant_status": "disease_suspected", "possible_disease": "<Specific Disease Name, e.g. Early Blight, Late Blight, Leaf Rust, Leaf Blast, Bacterial Blight, Powdery Mildew>", "severity": "Low" | "Moderate" | "Severe"

6. STEP 6 - Confidence & Practical Advice:
   - "confidence_level": "High visual likelihood" | "Moderate visual likelihood" | "Low visual likelihood" | "Uncertain"
   - "visible_signs": [list 2-4 specific visual symptoms observed on leaf/plant]
   - "recommended_actions": [list 2-4 practical agronomic steps: e.g. pruning, specific generic fungicide/biocontrol options with dosage per liter, irrigation adjustments]
   - "prevention": [list 2-3 preventive farming practices: e.g. crop rotation, mulch barrier, resistant seeds]
   - "hindi_explanation": "<A clear 1-2 sentence explanation in Hindi summarizing the finding and advice in simple language>"
   - "uncertainty_note": "Visual symptoms can overlap between diseases, nutrient deficiencies, and environmental stress. Consult local Krishi Vigyan Kendra (KVK) or agronomist for critical decisions."

OUTPUT JSON SCHEMA:
{{
  "is_plant_image": true,
  "image_quality": "good",
  "detected_crop": "Tomato",
  "crop_match": true,
  "mismatch_message": null,
  "plant_status": "disease_suspected",
  "possible_disease": "Tomato Early Blight",
  "scientific_name": "Alternaria solani",
  "confidence_level": "High visual likelihood",
  "severity": "Moderate",
  "visible_signs": ["Dark brown concentric target-like rings on older leaves", "Yellow chlorotic margins around necrotic lesions"],
  "recommended_actions": ["Remove affected lower foliage to prevent spore splash", "Apply Mancozeb 75% WP @ 2.5g/L or Chlorothalonil @ 2g/L", "Switch to drip irrigation to keep canopy dry"],
  "prevention": ["Practice 3-year crop rotation with non-solanaceous crops", "Use certified disease-free seeds"],
  "hindi_explanation": "पत्तियों पर शुरुआती झुलसा (Early Blight) रोग के लक्षण दिखाई दे रहे हैं। प्रभावित पत्तियों को हटाएं और अनुशंसित फफूंदनाशक का छिड़काव करें।",
  "uncertainty_note": "Visual symptoms can overlap with other foliar stresses."
}}
"""

def is_gemini_configured() -> bool:
    """Checks whether GEMINI_API_KEY is present in environment."""
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    return bool(key and len(key) > 5)

def analyze_crop_image_with_gemini(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    selected_crop: str = "auto",
    user_id: str = None,
    scenario_id: str = None,
    filename: str = "leaf.jpg"
) -> dict:
    """
    Primary image analysis dispatcher:
    1. If GEMINI_API_KEY is configured, sends image to Gemini multimodal API.
    2. If Gemini is unavailable or not configured, uses demo pathology fallback.
    """
    clean_crop = str(selected_crop or "auto").strip()
    if clean_crop.lower() in {"auto", "auto detect crop", "auto detect", "autodetect", "null", "undefined", ""}:
        clean_crop = "auto"

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()

    if is_gemini_configured():
        try:
            gemini_result = _call_gemini_api(api_key, image_bytes, mime_type, clean_crop)
            if gemini_result:
                # Format final unified payload
                formatted = _format_gemini_response(gemini_result, clean_crop, user_id, filename)
                _persist_scan_record(formatted, user_id)
                return formatted
        except Exception as e:
            print(f"[GeminiDiseaseService] Gemini API call notice: {str(e)} (falling back to demo mode)")

    # Fallback to Demo Mode with transparent labeling
    demo_res = _generate_demo_fallback(clean_crop, image_bytes, scenario_id, user_id, filename)
    _persist_scan_record(demo_res, user_id)
    return demo_res


def _call_gemini_api(api_key: str, image_bytes: bytes, mime_type: str, selected_crop: str) -> dict:
    """
    Executes REST call to Gemini 1.5 Flash multimodal endpoint.
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
            "temperature": 0.15,
            "response_mime_type": "application/json"
        }
    }

    url = f"{GEMINI_API_URL}?key={api_key}"
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, json=payload, headers=headers, timeout=25)
    
    if response.status_code != 200:
        raise RuntimeError(f"Gemini API returned status {response.status_code}: {response.text[:200]}")

    resp_json = response.json()
    candidates = resp_json.get("candidates", [])
    if not candidates:
        raise RuntimeError("No candidate response from Gemini.")

    content_parts = candidates[0].get("content", {}).get("parts", [])
    if not content_parts:
        raise RuntimeError("Empty content parts in Gemini response.")

    raw_text = content_parts[0].get("text", "").strip()
    
    # Strip markdown fence if present
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:]
    if raw_text.startswith("```"):
        raw_text = raw_text[3:]
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]

    parsed_json = json.loads(raw_text.strip())
    return parsed_json


def _format_gemini_response(data: dict, selected_crop: str, user_id: str, filename: str) -> dict:
    """
    Transforms Gemini JSON into the AGRO-SMART application schema.
    """
    is_plant = data.get("is_plant_image", True)
    image_quality = data.get("image_quality", "good")
    detected_crop = data.get("detected_crop") or (selected_crop if selected_crop != "auto" else "Crop Foliage")
    crop_match = data.get("crop_match", True)
    plant_status = data.get("plant_status", "disease_suspected")
    
    # Handle Non-Plant Image
    if not is_plant:
        return {
            "success": False,
            "is_plant_image": False,
            "error_code": "NON_PLANT_IMAGE",
            "message": data.get("message") or "This image does not appear to contain a crop or plant. Please upload a clear image of the affected plant, leaf, stem, fruit, or crop.",
            "sub_message": "Try taking the photo in good lighting and keep the affected plant area clearly visible.",
            "analysis_source": "gemini",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

    # Handle Unclear Image
    if image_quality == "unclear":
        return {
            "success": False,
            "is_plant_image": True,
            "image_quality": "unclear",
            "error_code": "IMAGE_UNCLEAR",
            "message": data.get("message") or "Unable to clearly analyze this image. Please upload a sharper, well-lit close-up of the affected crop.",
            "sub_message": "Ensure the camera is focused on the leaf or stem symptoms without extreme glare or shadows.",
            "analysis_source": "gemini",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

    # Handle Crop Mismatch
    is_mismatch = not crop_match and selected_crop != "auto" and selected_crop != detected_crop
    
    possible_disease = data.get("possible_disease")
    if plant_status == "healthy":
        possible_disease = "Healthy / No obvious disease symptoms visible"

    now_iso = time.strftime("%Y-%m-%d %H:%M:%S")
    scan_id = f"scn-gemini-{uuid.uuid4().hex[:8]}"

    return {
        "id": scan_id,
        "success": True,
        "is_plant_image": True,
        "image_quality": "good",
        "analysis_source": "gemini",
        "demo_mode": False,
        "selected_crop": selected_crop,
        "detected_crop": detected_crop,
        "crop_name": detected_crop,
        "crop_match": not is_mismatch,
        "mismatch_warning": data.get("mismatch_message") if is_mismatch else None,
        "plant_status": plant_status,
        "detected_disease": possible_disease,
        "disease": possible_disease,
        "scientific_name": data.get("scientific_name", "Plantae"),
        "confidence": 0.88 if plant_status != "uncertain" else 0.55,
        "confidence_level": data.get("confidence_level", "High visual likelihood"),
        "severity": data.get("severity", "Moderate" if plant_status != "healthy" else "None"),
        "visible_signs": data.get("visible_signs", ["Foliar inspection completed via Gemini AI Vision"]),
        "symptoms": data.get("visible_signs", []),
        "recommended_actions": data.get("recommended_actions", []),
        "advice": data.get("recommended_actions", []),
        "prevention": data.get("prevention", []),
        "hindi_explanation": data.get("hindi_explanation", ""),
        "regional_explanation": data.get("hindi_explanation", ""),
        "uncertainty_note": data.get("uncertainty_note", "Visual symptoms can overlap with other agronomic factors."),
        "safety_disclaimer": "AI provides preliminary visual decision support only — not a guaranteed diagnosis. Consult local agricultural experts before applying major chemical interventions.",
        "filename": filename,
        "timestamp": now_iso
    }


def _generate_demo_fallback(
    selected_crop: str, 
    image_bytes: bytes, 
    scenario_id: str, 
    user_id: str, 
    filename: str
) -> dict:
    """
    Generates transparently labeled Demo Analysis when Gemini is offline or unconfigured.
    """
    clean_crop = selected_crop if selected_crop != "auto" else "Tomato"
    
    # Use existing disease_service knowledge base
    demo_base = analyze_crop_disease(
        image_file=None,
        crop_name=clean_crop,
        user_id=user_id,
        filename=filename,
        scenario_id=scenario_id
    )
    
    demo_base["analysis_source"] = "demo"
    demo_base["demo_mode"] = True
    demo_base["demo_label"] = "Demo Analysis"
    demo_base["demo_disclaimer"] = "Prototype demonstration — real AI disease model is not currently connected."
    demo_base["selected_crop"] = selected_crop
    demo_base["detected_crop"] = clean_crop
    demo_base["crop_match"] = True
    demo_base["is_plant_image"] = True
    demo_base["image_quality"] = "good"
    demo_base["confidence_level"] = "Demo Simulation"
    
    return demo_base


def _persist_scan_record(record: dict, user_id: str = None):
    """
    Persists scan in memory / Supabase history store.
    """
    try:
        supabase_client.from_("disease_scans").insert({
            "id": record.get("id") or f"scn-{int(time.time())}",
            "user_id": user_id or "usr-demo-farmer-01",
            "crop": record.get("detected_crop") or record.get("crop_name") or "Tomato",
            "crop_name": record.get("detected_crop") or record.get("crop_name") or "Tomato",
            "disease": record.get("detected_disease") or record.get("disease") or "Foliar Analysis",
            "detected_disease": record.get("detected_disease") or record.get("disease") or "Foliar Analysis",
            "severity": record.get("severity", "Moderate"),
            "analysis_source": record.get("analysis_source", "gemini"),
            "created_at": record.get("timestamp") or time.strftime("%Y-%m-%d %H:%M:%S")
        }).execute()
    except Exception as err:
        pass

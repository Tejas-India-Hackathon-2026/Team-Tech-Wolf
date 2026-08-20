# AI Crop Disease Detection

**Intelligent Multimodal Foliar Pathology & Agricultural Decision Support**

---

## 1. Purpose

The **AI Crop Disease Detection** module in AGRO-SMART empowers farmers, field workers, and agricultural extension officers with rapid, preliminary visual pathology assessments directly from smartphone photographs of crop foliage. By providing instant identification of foliar abnormalities, observable symptom breakdowns, and actionable dosage recommendations, the system helps prevent severe crop loss and optimizes pesticide/fertilizer usage.

---

## 2. Processing Flow

```text
Farmer Uploads Plant Image
           │
           ▼
Image Validation (File type, size & format verification)
           │
           ▼
Plant / Non-Plant Verification (Hard gate: blocks non-agricultural objects)
           │
           ▼
Automatic Crop Identification (Auto-detects species: Rice, Wheat, Tomato, Maize, etc.)
           │
           ▼
Gemini Multimodal Vision Analysis (Deep foliar pathology inspection)
           │
           ▼
Disease Identification (Pathogen, fungal/bacterial lesion & stress classification)
           │
           ▼
Symptoms & Severity Interpretation (Low, Moderate, High, Severe, or Healthy)
           │
           ▼
Actionable Farmer Recommendations (Generic chemical/organic remedies & preventive practices)
           │
           ▼
Structured Result Display (Diagnostic card, Hindi advisory & confidence indicators)
```

---

## 3. Gemini API Integration

- **Backend-Only Invocation**: All multimodal vision calls are executed strictly within the Flask backend (`backend/services/gemini_disease_service.py`).
- **Secure Key Management**: The service reads `GEMINI_API_KEY` from `backend/.env` using `python-dotenv`. API keys are never bundled, transmitted, or exposed to the client-side React code.
- **Multimodal Payload**: The uploaded image is base64-encoded and sent alongside a strict multi-step prompt with enforced JSON response schemas (`application/json`).
- **Structured Data Transformation**: The raw AI response is parsed, validated against internal schemas, sanitized, and returned as a standardized API response.

---

## 4. Auto Crop Detection

Farmers are not required to guess or manually specify the crop species before scanning:
- When the user selects **Auto Detect Crop** (sending `crop=auto`), the vision model identifies the crop species directly from leaf characteristics, growth habit, and visual anatomy.
- Supported major crops include **Tomato**, **Potato**, **Rice**, **Wheat**, **Cotton**, and **Corn / Maize**.
- If the crop species cannot be determined with sufficient confidence, the system returns a `CROP_UNCERTAIN` code prompting the farmer to select the crop manually or upload a clearer photo, rather than guessing or defaulting to a fallback crop.

---

## 5. Non-Plant Image Rejection (Hard Gating)

To prevent false-positive diagnoses and maintain credibility, the analysis pipeline enforces a strict **Step 1 Hard Gate**:
- **Automatic Rejection**: If an uploaded image contains non-plant content (such as a laptop, human face, automobile, bottle, building, animal, or document), analysis is terminated immediately before any disease evaluation occurs.
- **Payload Returned**:
  ```json
  {
    "success": false,
    "is_plant": false,
    "is_plant_image": false,
    "error_code": "NON_PLANT_IMAGE",
    "message": "This image does not appear to contain a plant or crop. Please upload a clear photo of a real plant or leaf."
  }
  ```
- **Frontend Experience**: The UI displays a dedicated **Invalid Crop Image** alert with clear photographic tips, suppressing all disease cards, crop badges, and confidence metrics.

---

## 6. Disease Analysis Output Structure

When a valid agricultural plant photo is processed, the system returns a comprehensive diagnostic report:

| Output Field | Description | Example |
| :--- | :--- | :--- |
| **`detected_crop`** | Identified crop species | `Rice` / `Tomato` / `Maize` |
| **`possible_disease`** | Specific foliar disease or physiological disorder | `Rice Leaf Blast` / `Early Blight` / `Healthy` |
| **`scientific_name`** | Causal biological organism | *Magnaporthe oryzae* / *Alternaria solani* |
| **`confidence_level`** | Visual likelihood indicator | `High visual likelihood` / `Medium visual likelihood` |
| **`severity`** | Foliar damage severity grade | `Low`, `Moderate`, `High`, `Severe`, `None` |
| **`visible_signs`** | Observable physical symptoms on leaf/stem | `Spindle lesions with brown borders and gray centers` |
| **`recommended_actions`**| Actionable curative treatments & generic dosages | `Apply Tricyclazole 75% WP @ 0.6g per litre of water` |
| **`prevention`** | Cultural & preventive agricultural practices | `Treat nursery seeds with bio-fungicide; avoid excess N` |
| **`regional_explanation`**| Regional language advisory (*किसान सलाह*) | `धान पर झोंका (ब्लास्ट) रोग के लक्षण हैं। ट्राईसाइक्लाजोल का छिड़काव करें।` |

---

## 7. Safety & Agricultural Disclaimer

> [!IMPORTANT]
> **Preliminary Decision Support Only**: AI-generated pathology reports provide preliminary visual decision support and do not constitute a guaranteed botanical diagnosis or certified agronomic prescription. Field conditions, nutritional deficiencies, and overlapping pest attacks can present similar visual symptoms. Farmers are advised to cross-verify findings with local Krishi Vigyan Kendra (KVK) officers, agricultural extension agents, or certified plant pathologists prior to initiating extensive chemical interventions.

---

## 8. Service Architecture

The disease detection feature is structured into distinct, modular layers:

```text
┌─────────────────────────────────────────────────────────────┐
│       Frontend Disease Page (DiseaseDetectionPage.jsx)      │
│  - Drag-and-drop file upload & live camera input            │
│  - Crop selection dropdown with "Auto Detect Crop" default  │
│  - Dedicated error cards (Non-Plant, Unclear, Mismatch)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ POST /api/disease/analyze (FormData)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│       Flask Route Controller (disease_routes.py)            │
│  - File format validation (JPG, PNG, WEBP, BMP ≤ 10MB)      │
│  - Multipart form parsing & image buffer extraction         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│       Gemini Disease Service (gemini_disease_service.py)    │
│  - Prompt assembly with multi-stage evaluation instructions │
│  - Model invocation with fallback candidate handling        │
│  - Response parsing, schema validation & scan persistence   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST POST (JSON + Base64)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│       Google Gemini Multimodal Vision API                   │
│  - gemini-2.5-flash / gemini-flash-latest                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Future Improvements & Roadmap

1. **Fine-Tuned Domain Models**: Train domain-specific vision transformers on curated Indian agricultural datasets (ICAR/KVK leaf pathology databases).
2. **Expanded Pathology Catalog**: Broaden disease coverage to horticultural crops, spices, pulses, and oilseeds.
3. **Edge / On-Device Inference**: Deploy lightweight quantized models (TensorFlow Lite / ONNX) for real-time offline diagnosis in remote farming areas without network connectivity.
4. **Multilingual Voice Advisory**: Integrate text-to-speech audio advisories in Marathi, Hindi, Telugu, Tamil, Punjabi, and Bengali.
5. **IoT Sensor Correlation**: Cross-reference visual foliar symptoms with localized soil moisture, leaf wetness, and humidity sensor readings for higher diagnostic accuracy.

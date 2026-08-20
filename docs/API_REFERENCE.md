# AGRO-SMART API Reference

**Comprehensive RESTful Endpoint Documentation & Payload Specifications**

---

## 1. API Overview

The AGRO-SMART backend is powered by a modular **Python Flask REST API** that services the React single-page application. All endpoints follow RESTful conventions, returning standardized JSON envelopes with explicit HTTP status codes.

---

## 2. Base URL & Environment Configuration

- **Direct Flask Server**: `http://localhost:5000/api`
- **Vite Development Proxy**: `/api` (automatically forwarded from `http://localhost:5173` / `http://localhost:5174` to `http://localhost:5000`)
- **Root Service Manifest**: `GET http://localhost:5000/`

---

## 3. Health & System API

### `GET /api/health`
Checks backend engine status, database connection mode, and API integration readiness flags without exposing secrets.

- **Method**: `GET`
- **Auth Required**: None (Public)
- **Response Format**:
  ```json
  {
    "status": "ok",
    "app": "AGRO-SMART Full-Stack Engine",
    "version": "1.0.0",
    "database_configured": false,
    "weather_service_configured": false,
    "disease_service_configured": true,
    "timestamp": "2026-08-21T02:00:00Z"
  }
  ```

---

## 4. Authentication APIs (`/api/auth`)

### `POST /api/auth/register`
Registers a new Farmer or Machinery Owner account (Admin self-registration is strictly blocked).

- **Method**: `POST`
- **Auth Required**: None (Public)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "name": "Rameshwar Patel",
    "phone": "9876543210",
    "email": "farmer@agro-smart.com",
    "password": "Password@123",
    "user_type": "Farmer",
    "state": "Bihar",
    "district": "Patna"
  }
  ```
- **Response**: `201 Created` with sanitized user object and session token.

---

### `POST /api/auth/login`
Authenticates a user via Mobile Number or Email + Password.

- **Method**: `POST`
- **Auth Required**: None (Public)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "identifier": "farmer@agro-smart.com",
    "password": "Password@123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "usr-demo-farmer-01",
        "name": "Rameshwar Patel",
        "email": "farmer@agro-smart.com",
        "phone": "9876543210",
        "role": "farmer",
        "user_type": "Farmer",
        "state": "Bihar",
        "district": "Patna"
      },
      "token": "demo-tok-a1b2c3d4e5",
      "is_demo_session": true
    }
  }
  ```

---

### `GET /api/auth/me`
Retrieves the currently authenticated user's profile from the session token.

- **Method**: `GET`
- **Auth Required**: `Bearer <token>` in `Authorization` header
- **Response**: `200 OK` with user profile object.

---

### `POST /api/auth/logout`
Terminates the active session token.

- **Method**: `POST`
- **Auth Required**: `Bearer <token>` in `Authorization` header
- **Response**: `200 OK`

---

## 5. Crop Disease Detection APIs (`/api/disease`)

### `POST /api/disease/analyze`
Primary visual pathology endpoint. Analyzes uploaded foliage images using Gemini Multimodal Vision, enforcing Step 1 plant verification, image quality checks, auto crop identification, and disease pathology.

- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `image` *(binary file, required)*: JPG, PNG, WEBP, or BMP format ($\le 10\text{ MB}$)
  - `crop` *(string, optional)*: `"auto"` / `"Auto Detect Crop"` or specific crop (`"Tomato"`, `"Potato"`, `"Rice"`, etc.)
  - `user_id` *(string, optional)*: Active user ID for scan logging
  - `scenario_id` *(string, optional)*: Explicit demo scenario trigger
- **Response (Plant Pathology Detected)**: `200 OK`
  ```json
  {
    "success": true,
    "status": "success",
    "message": "Crop visual analysis completed successfully",
    "data": {
      "id": "scn-gemini-a1b2c3",
      "is_plant": true,
      "is_plant_image": true,
      "detected_crop": "Tomato",
      "crop_name": "Tomato",
      "plant_status": "disease_suspected",
      "detected_disease": "Early Blight",
      "scientific_name": "Alternaria solani",
      "confidence_level": "High visual likelihood",
      "severity": "Moderate",
      "visible_signs": ["Concentric dark rings with yellow halo on lower leaves"],
      "recommended_actions": ["Apply Mancozeb 75% WP @ 2.5g per litre of water"],
      "prevention": ["Rotate with non-solanaceous crops"],
      "regional_explanation": "टमाटर की पत्तियों पर अगेती झुलसा के लक्षण हैं।"
    }
  }
  ```
- **Response (Non-Plant Image Rejection)**:
  ```json
  {
    "success": false,
    "is_plant": false,
    "is_plant_image": false,
    "error_code": "NON_PLANT_IMAGE",
    "message": "This image does not appear to contain a plant or crop. Please upload a clear photo of a real plant or leaf."
  }
  ```

---

### `GET /api/disease/history`
Returns recent crop disease scan history for the authenticated farmer.
- **Method**: `GET` | **Query Params**: `limit` (default 10)

### `GET /api/disease/crops`
Returns list of supported crop categories with `"Auto Detect Crop"`.

### `GET /api/disease/library`
Returns reference disease dictionary with symptom catalogs and generic chemical recommendations.

---

## 6. Weather Risk Intelligence APIs (`/api/weather`)

### `GET /api/weather/risk`
Primary agronomic weather endpoint. Translates live meteorological data from Open-Meteo into crop-specific disease risk, heat stress, and spray suitability windows.

- **Method**: `GET`
- **Query Parameters**:
  - `location` *(string)*: e.g. `"Patna, Bihar"` or `"Pune, Maharashtra"`
  - `crop` *(string)*: e.g. `"Tomato"`, `"Potato"`, `"Rice"`, `"Wheat"`, `"Corn"`
  - `lat`, `lon` *(float, optional)*: Farmer coordinates
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "location": "Patna, Bihar",
      "crop": "Tomato",
      "temperature": 32.0,
      "humidity": 78.0,
      "rain_chance": 65,
      "wind_speed": 9.5,
      "weather_condition": "High Rain Probability",
      "risk_level": "MODERATE",
      "concern": "High humidity + rainfall may increase fungal disease risk (Early Blight / Septoria).",
      "action": "Monitor leaves closely and avoid irrigation before rainfall. Apply bio-fungicide once foliage dries.",
      "spray_status": "Avoid",
      "spray_advice": "Rain probability is high (65%). Delay foliar sprays to prevent chemical wash-off.",
      "forecast": [
        {"day": "Today", "temp_max": 33.0, "temp_min": 24.0, "rain_chance": 65, "humidity": 78}
      ]
    }
  }
  ```

### `GET /api/weather/locations`
Returns list of pre-indexed Indian agricultural district hubs.

---

## 7. Machinery Rental & Booking APIs (`/api/machinery`)

### `GET /api/machinery`
Retrieves available agricultural equipment listings.

- **Method**: `GET`
- **Query Parameters**: `location`, `type` (*Tractor, Harvester, Rotavator, Cultivator, Seed Drill*), `sort` (*distance_asc, price_asc, price_desc, rating_desc*), `search`, `max_distance`.

---

### `POST /api/machinery/bookings`
Submits a new machinery rental booking request with server-side double-booking checks.

- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "machinery_id": "eq-101",
    "farmer_name": "Rameshwar Patel",
    "farmer_phone": "9876543210",
    "service_location": "Patna Rural, Bihar",
    "booking_date": "2026-08-25",
    "start_time": "08:00 AM",
    "duration": 4.0
  }
  ```
- **Response**: `201 Created` with booking record (`status: "PENDING"`).

---

### `GET /api/machinery/bookings`
Returns all shared bookings for dashboard synchronization.
- **Method**: `GET`

---

### `PATCH /api/machinery/bookings/<id>/status`
Updates rental lifecycle status (`ACCEPTED`, `REJECTED`, `COMPLETED`, `CANCELLED`).

- **Method**: `PATCH`
- **Request Body**: `{"status": "ACCEPTED"}`
- **Response**: `200 OK`

---

## 8. Market Intelligence APIs (`/api/market`)

### `GET /api/market/analysis`
Generates historical price series, percentage change, transparent estimate ranges, and selling recommendations.

- **Method**: `GET`
- **Query Parameters**:
  - `crop` *(string)*: `"Tomato"`, `"Potato"`, `"Onion"`, `"Wheat"`, `"Rice"`, `"Maize"`
  - `location` *(string)*: Target Mandi name (e.g. `"Patna Mandi, Bihar"`)
  - `days` *(integer)*: `7`, `15`, or `30`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "crop": "Tomato",
      "location": "Patna Mandi, Bihar",
      "days": 30,
      "current_price": 2200,
      "percentage_change": 8.0,
      "average_price": 2110.5,
      "high_price": 2240,
      "low_price": 1980,
      "estimated_min": 2266,
      "estimated_max": 2464,
      "trend": "Rising",
      "recommendation": "MONITOR / WAIT",
      "explanation": "Prices have risen 8.0% over the past 30 days with strong buying demand...",
      "historical_prices": [
        {"date": "2026-08-01", "formatted_date": "01 Aug", "price": 2040}
      ]
    }
  }
  ```

---

### `GET /api/market/arbitrage`
Calculates net realization across regional mandis after deducting round-trip truck freight costs.

- **Method**: `GET`
- **Query Parameters**: `crop`, `quantity` (quintals), `transport_cost` (₹/km).

---

## 9. Administrator APIs (`/api/admin`)

### `GET /api/admin/stats`
Returns platform aggregate metrics (total users, active listings, total bookings, platform volume).

### `GET /api/admin/users`
Returns all registered user profiles with search and role filtering.

### `PATCH /api/admin/users/<id>/status`
Toggles account status between `Active` and `Disabled`.

### `PATCH /api/admin/users/<id>/role`
Modifies user role between `farmer` and `machine_owner`.

### `GET /api/admin/machinery` & `DELETE /api/admin/machinery/<id>`
Moderates and removes machinery listings.

---

## 10. Standard Response & Error Format

### Success Format (`success_response`)
```json
{
  "success": true,
  "status": "success",
  "message": "Descriptive message",
  "data": { ... }
}
```

### Error Format (`error_response`)
```json
{
  "success": false,
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error explanation",
    "details": "Additional non-sensitive error context"
  }
}
```
*Stack traces are never exposed in JSON responses.*

---

## 11. Authentication & Authorization Requirements

| Route Group | Authorization Level | Header Required |
| :--- | :--- | :--- |
| `/api/auth/register`, `/api/auth/login` | Public | None |
| `/api/auth/me`, `/api/auth/logout` | Authenticated User | `Authorization: Bearer <token>` |
| `/api/disease/*`, `/api/weather/*`, `/api/market/*` | Public / Logged-in | None |
| `/api/machinery/bookings` (create/update) | Authenticated Farmer/Owner | Session user ID |
| `/api/admin/*` | System Admin | Admin session verification |

---

## 12. External Service Flow

```text
Flask Backend Route
       │
       ├─► Gemini Multimodal Vision API  (Disease image analysis)
       ├─► Open-Meteo Agro-Weather API   (Hyperlocal live weather)
       ├─► APMC / Agmarknet Service      (Mandi commodity spot pricing)
       └─► Supabase / In-Memory Store    (User, booking & scan records)
```

---

## 13. Security & Secret Management

- **Zero Client Key Exposure**: `GEMINI_API_KEY`, `WEATHER_API_KEY`, and `SUPABASE_KEY` reside exclusively in `backend/.env`.
- **Sanitized Headers**: Cross-origin headers (`CORS`) are restricted to allowed frontend hosts.
- **Salted Password Hashing**: Passwords are saved only as salted SHA-256 digests.

---

## 14. Jury Quick Reference

> *"How does your frontend communicate with the backend?"*

```text
React Component (e.g. DiseaseDetectionPage.jsx)
                       │
                       ▼
Frontend Client Service (src/services/diseaseService.js via api.js)
                       │
                       ▼ HTTP POST /api/disease/analyze (FormData)
Vite Proxy (localhost:5174/api ➔ localhost:5000/api)
                       │
                       ▼
Flask Blueprint Route Controller (disease_routes.py)
                       │
                       ▼
Backend Service Logic (gemini_disease_service.py)
                       │
                       ▼ REST (Base64 Image + JSON Schema)
External Provider (Google Gemini Vision API)
                       │
                       ▼
Structured Response Envelope (success_response JSON)
                       │
                       ▼
React Component Updates State & Renders UI
```

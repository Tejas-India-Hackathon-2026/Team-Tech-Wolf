# Weather Risk Intelligence

**Translating Meteorological Observations into Actionable Agronomic Decision Support**

---

## 1. Purpose

Traditional weather applications present raw meteorological metrics (e.g. *32°C, 80% humidity, 15 km/h wind*), leaving farmers to guess what these figures mean for their crops. 

**AGRO-SMART Weather Risk Intelligence** bridges this gap by interpreting live weather parameters through a specialized agronomic rules engine. The platform translates atmospheric data into crop-specific disease vulnerability warnings, heat and frost alerts, irrigation recommendations, and spray suitability windows.

---

## 2. Weather Processing Flow

```text
Farmer Location Input (City / District / Coordinates)
           │
           ▼
Location Resolution (Preset hub lookup & Open-Meteo geocoding)
           │
           ▼
Weather Data Provider (Live Open-Meteo API query)
           │
           ▼
Current & Forecast Weather Extraction (Temperature, Humidity, Rain %, Wind, WMO Codes)
           │
           ▼
Crop Context Selection (Tomato, Potato, Rice, Wheat, Cotton, Corn, Sugarcane)
           │
           ▼
Agronomic Risk Evaluation (Pathology thresholds, thermal stress & wash-off limits)
           │
           ▼
Actionable Farmer Advisory (Risk severity, management steps & spray suitability)
           │
           ▼
Structured UI Display (Interactive gauges, risk badges & 7-day forecast cards)
```

---

## 3. Weather Data & Ingested Parameters

AGRO-SMART integrates with the **Open-Meteo Agro-Weather API** (a zero-key, high-availability meteorological service) to ingest the following parameters:

| Parameter | Unit | Agronomic Relevance |
| :--- | :--- | :--- |
| **Temperature (`temperature_2m`)** | °C | Identifies heat stress (>34°C), flower drop, pollen sterility, and frost hazards (<4°C). |
| **Relative Humidity (`relative_humidity_2m`)** | % | Tracks fungal spore incubation (>65%) and saturation thresholds (>80% for Late Blight / Blast). |
| **Precipitation Probability** | % | Dictates irrigation schedules and fungicide wash-off risks. |
| **Wind Speed (`wind_speed_10m`)** | km/h | Evaluates chemical spray drift hazards (>15 km/h) and lodging risks. |
| **Precipitation Amount** | mm | Measures rain volume for drainage and waterlogging management. |
| **7-Day Daily Forecast** | Daily | Multi-day temperature min/max and precipitation trends for weekly planning. |

---

## 4. Location-Based Weather Resolution

The system resolves location queries dynamically using a two-tier mechanism:

1. **Preset Indian Agricultural Hubs**: Fast local dictionary matching covering major farming districts (e.g. *Patna, Pune, Nashik, Nagpur, Latur, Karnal, Ludhiana, Agra, Varanasi, Jaipur, Indore, Bhopal, Ahmedabad, Bengaluru, Hyderabad, Coimbatore*).
2. **Open-Meteo Geocoding Service**: If a farmer enters a custom town, taluka, or district not in the preset list, the backend queries `https://geocoding-api.open-meteo.com/v1/search?name=...` to dynamically resolve the exact latitude and longitude.

---

## 5. Crop-Specific Risk Intelligence

### Raw Weather vs. AGRO-SMART Intelligence

```text
┌─────────────────────────────────────────────────────────────┐
│                     RAW WEATHER READING                     │
│  Temperature: 32°C  •  Humidity: 80%  •  Rain Chance: 75%   │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 AGRO-SMART CROP INTELLIGENCE                │
│                                                             │
│  [Crop: Tomato]                                             │
│  • Risk Level: MODERATE / HIGH                              │
│  • Concern: High humidity + rainfall creates severe fungal  │
│    incubation risk (Early Blight / Septoria).               │
│  • Action: Avoid irrigation; prune lower diseased foliage;  │
│    apply bio-fungicide once leaf surfaces dry.              │
│  • Spray Window: AVOID (Rain chance 75% - wash-off risk).   │
│                                                             │
│  [Crop: Rice]                                               │
│  • Risk Level: HIGH                                         │
│  • Concern: Warm humidity promotes Rice Blast & Sheath      │
│    Blight development.                                      │
│  • Action: Maintain proper drainage and scout field bunds.  │
└─────────────────────────────────────────────────────────────┘
```

The same weather conditions present completely different risks depending on the selected crop species and its physiological vulnerabilities.

---

## 6. Supported Risk Levels & Spray Windows

### Agronomic Risk Levels
- **`LOW` (Green)**: Optimal growing conditions with minimal weather-induced pest or pathogen pressure.
- **`MODERATE` (Yellow/Amber)**: Elevated humidity or minor temperature deviations requiring close scouting and preventive cultural practices.
- **`HIGH` (Orange)**: Favorable fungal incubation or significant thermal stress threatening crop yield.
- **`CRITICAL` (Red)**: Severe imminent danger (e.g. Frost <3°C, Extreme Heat >38°C, or Heavy Downpour >50mm) requiring urgent defensive action.

### Spray Suitability Windows
- **`Safe` (Green)**: Low wind (<12 km/h), moderate humidity, and <20% rain probability. Ideal for chemical or bio-spray application.
- **`Caution` (Yellow)**: Moderate wind or 20–50% rain chance. Spray only during calm morning hours with sticker adjuvant.
- **`Avoid` (Red)**: High wind (>15 km/h cause chemical drift) or high rain chance (>50% causes wash-off).

---

## 7. Farmer Advisory & Recommendations

Every risk assessment generates actionable, understandable field recommendations:
- **Immediate Crop Actions**: Precise field measures (e.g. *"Provide light early morning sprinkler misting to reduce canopy heat"* or *"Avoid nitrogen top-dressing during heavy cloud cover"*).
- **Irrigation Guidance**: Advises whether to pause tube-well pumps before forecasted showers to conserve water and prevent root rot.
- **Foliar Spray Advice**: Direct instructions on whether to spray fungicides/pesticides or delay application to avoid financial waste from chemical wash-off.

---

## 8. Backend Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│        Frontend Weather Page (WeatherIntelligencePage.jsx)  │
│  - Location search bar & crop selector dropdown             │
│  - Dynamic risk gauges, metric cards & 7-day forecast tabs  │
└──────────────────────────────┬──────────────────────────────┘
                               │ GET /api/weather/risk?crop=...&location=...
                               ▼
┌─────────────────────────────────────────────────────────────┐
│        Flask Weather Blueprint (weather_routes.py)          │
│  - Query parameter extraction, validation & sanitization    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│        Weather Service Layer (weather_service.py)           │
│  - resolve_location_coordinates() [Geocoding]               │
│  - fetch_live_weather()           [Open-Meteo REST Client]  │
│  - evaluate_crop_risk()           [Agronomic Rules Engine]  │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON Response
                               ▼
┌─────────────────────────────────────────────────────────────┐
│        Structured Response & Frontend Visualization         │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Failure & Fallback Handling

To guarantee uninterrupted usability during offline demonstrations or third-party network timeouts:
- **Geocoding Fallback**: If Open-Meteo geocoding times out, the system defaults to the nearest pre-indexed agricultural hub without crashing.
- **Weather Data Fallback**: If live meteorological API queries encounter an error, `fetch_live_weather()` seamlessly returns realistic 7-day seasonal fallback forecasts with clearly formatted metric cards.
- **Graceful UI Rendering**: The frontend handles empty or pending responses gracefully without blank screens or unhandled exceptions.

---

## 10. Future Improvements & Roadmap

1. **Hyperlocal Micro-Climate Grids**: Ingest high-resolution ($\le 1\text{ km}$) radar and satellite reanalysis data.
2. **Soil Moisture & Temperature Probes**: Combine atmospheric weather with sub-surface sensor telemetry.
3. **IoT Farm Station Integration**: Ingest real-time leaf wetness and canopy temperature from on-farm IoT sensors.
4. **Automated Push & SMS Alerts**: Dispatch severe weather SMS/WhatsApp notifications to registered farmers before hail, frost, or storms.
5. **Growth-Stage Aware Models**: Correlate weather risks with specific crop phenological stages (e.g. *Germination, Vegetative, Flowering, Grain Filling, Harvesting*).

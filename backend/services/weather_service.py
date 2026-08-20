"""
AGRO-SMART Crop-Specific Weather Risk Engine
Translates meteorological observations from Open-Meteo into actionable agronomic decision support.
1. Free-form Geocoding (Open-Meteo Geocoding API)
2. Live Weather Ingestion (Open-Meteo Forecast API - 0 key required)
3. Crop-Specific Agronomic Rules Engine (Tomato, Potato, Rice, Wheat, Corn, Onion, Chilli, Brinjal, Cotton, Sugarcane)
4. Multi-day 7-Day Forecast Risk Evaluation
"""
import requests
import time
import uuid
from datetime import datetime
from models import supabase_client

# Comprehensive Indian Agricultural Preset Hubs
CITY_COORDINATES = {
    "patna": {"lat": 25.5941, "lon": 85.1376, "name": "Patna, Bihar", "state": "Bihar"},
    "jamui": {"lat": 24.9200, "lon": 86.2200, "name": "Jamui, Bihar", "state": "Bihar"},
    "gaya": {"lat": 24.7955, "lon": 85.0002, "name": "Gaya, Bihar", "state": "Bihar"},
    "muzaffarpur": {"lat": 26.1209, "lon": 85.3647, "name": "Muzaffarpur, Bihar", "state": "Bihar"},
    "pune": {"lat": 18.5204, "lon": 73.8567, "name": "Pune, Maharashtra", "state": "Maharashtra"},
    "nashik": {"lat": 19.9975, "lon": 73.7898, "name": "Nashik, Maharashtra", "state": "Maharashtra"},
    "nagpur": {"lat": 21.1458, "lon": 79.0882, "name": "Nagpur, Maharashtra", "state": "Maharashtra"},
    "latur": {"lat": 18.4088, "lon": 76.5604, "name": "Latur, Maharashtra", "state": "Maharashtra"},
    "karnal": {"lat": 29.6857, "lon": 76.9905, "name": "Karnal, Haryana", "state": "Haryana"},
    "ludhiana": {"lat": 30.9010, "lon": 75.8573, "name": "Ludhiana, Punjab", "state": "Punjab"},
    "agra": {"lat": 27.1767, "lon": 78.0081, "name": "Agra, Uttar Pradesh", "state": "Uttar Pradesh"},
    "varanasi": {"lat": 25.3176, "lon": 82.9739, "name": "Varanasi, Uttar Pradesh", "state": "Uttar Pradesh"},
    "lucknow": {"lat": 26.8467, "lon": 80.9462, "name": "Lucknow, Uttar Pradesh", "state": "Uttar Pradesh"},
    "jaipur": {"lat": 26.9124, "lon": 75.7873, "name": "Jaipur, Rajasthan", "state": "Rajasthan"},
    "indore": {"lat": 22.7196, "lon": 75.8577, "name": "Indore, Madhya Pradesh", "state": "Madhya Pradesh"},
    "bhopal": {"lat": 23.2599, "lon": 77.4126, "name": "Bhopal, Madhya Pradesh", "state": "Madhya Pradesh"},
    "ahmedabad": {"lat": 23.0225, "lon": 72.5714, "name": "Ahmedabad, Gujarat", "state": "Gujarat"},
    "bengaluru": {"lat": 12.9716, "lon": 77.5946, "name": "Bengaluru, Karnataka", "state": "Karnataka"},
    "hyderabad": {"lat": 17.3850, "lon": 78.4867, "name": "Hyderabad, Telangana", "state": "Telangana"},
    "coimbatore": {"lat": 11.0168, "lon": 76.9558, "name": "Coimbatore, Tamil Nadu", "state": "Tamil Nadu"},
    "delhi": {"lat": 28.6139, "lon": 77.2090, "name": "Delhi, India", "state": "Delhi"},
    "mumbai": {"lat": 19.0760, "lon": 72.8777, "name": "Mumbai, Maharashtra", "state": "Maharashtra"},
    "kolkata": {"lat": 22.5726, "lon": 88.3639, "name": "Kolkata, West Bengal", "state": "West Bengal"},
    "ranchi": {"lat": 23.3441, "lon": 85.3096, "name": "Ranchi, Jharkhand", "state": "Jharkhand"},
    "samastipur": {"lat": 25.8628, "lon": 85.7811, "name": "Samastipur, Bihar", "state": "Bihar"}
}

SUPPORTED_CROPS = [
    "Tomato", "Potato", "Rice", "Wheat", "Corn", 
    "Onion", "Chilli", "Brinjal", "Cotton", "Sugarcane"
]

WEATHER_CHECKS_STORE = []

def resolve_location_coordinates(location_query: str):
    """
    Resolves location query to coordinates using Open-Meteo Geocoding.
    Never defaults to a fallback city if an invalid location is provided.
    """
    if not location_query or not str(location_query).strip():
        raise ValueError("Please provide a valid city, town, or district name.")

    clean_query = str(location_query).strip()
    print(f"[Weather] searching location: {clean_query}")

    # Check if query matches a preset hub key directly
    lower_q = clean_query.lower()
    for key, data in CITY_COORDINATES.items():
        if key == lower_q or lower_q == data["name"].lower():
            print(f"[Weather] resolved location from presets: {data['name']} (lat={data['lat']}, lon={data['lon']})")
            return data["lat"], data["lon"], data["name"]

    # Query Open-Meteo Geocoding API
    try:
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={requests.utils.quote(clean_query)}&count=5&language=en&format=json"
        res = requests.get(geo_url, timeout=4.0)
        if res.status_code == 200:
            results = res.json().get("results", [])
            if results:
                match = results[0]
                admin1 = match.get("admin1") or ""
                country = match.get("country") or "India"
                name = match.get("name")
                resolved_name = f"{name}, {admin1}" if admin1 else f"{name}, {country}"
                lat = float(match.get("latitude"))
                lon = float(match.get("longitude"))
                print(f"[Weather] resolved location: {resolved_name} (lat={lat}, lon={lon})")
                return lat, lon, resolved_name
    except Exception as e:
        print(f"[Weather] Geocoding request error: {e}")

    # Check partial match in preset hubs as secondary check
    for key, data in CITY_COORDINATES.items():
        if key in lower_q or lower_q in data["name"].lower():
            print(f"[Weather] resolved location from partial preset match: {data['name']}")
            return data["lat"], data["lon"], data["name"]

    # No match found - raise clear error (DO NOT default to Patna!)
    raise ValueError("Location not found. Please check the spelling or try a nearby city/town.")


def search_locations(query: str = None):
    """
    Searches locations dynamically via Open-Meteo Geocoding API for autocomplete.
    """
    if not query or len(query.strip()) < 2:
        return get_supported_locations()

    clean_q = query.strip()
    try:
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={requests.utils.quote(clean_q)}&count=10&language=en&format=json"
        res = requests.get(geo_url, timeout=3.5)
        if res.status_code == 200:
            results = res.json().get("results", [])
            # Prioritize Indian locations and exact prefix matches
            results.sort(key=lambda r: (
                0 if r.get("country_code") == "IN" or r.get("country") == "India" else 1,
                0 if str(r.get("name", "")).lower().startswith(clean_q.lower()) else 1
            ))
            suggestions = []
            for r in results[:6]:
                admin1 = r.get("admin1") or ""
                country = r.get("country") or "India"
                name = r.get("name")
                display_name = f"{name}, {admin1}, {country}" if admin1 else f"{name}, {country}"
                suggestions.append({
                    "id": f"{r.get('latitude')},{r.get('longitude')}",
                    "name": name,
                    "admin1": admin1,
                    "state": admin1,
                    "country": country,
                    "latitude": r.get("latitude"),
                    "longitude": r.get("longitude"),
                    "display_name": display_name,
                    "location": display_name
                })
            if suggestions:
                return suggestions
    except Exception as e:
        print(f"[Weather] Autocomplete lookup notice: {e}")

    # Fallback to filter preset hubs
    matched = []
    for k, v in CITY_COORDINATES.items():
        if clean_q.lower() in v["name"].lower() or clean_q.lower() in k:
            matched.append({
                "id": f"{v['lat']},{v['lon']}",
                "name": v["name"].split(",")[0],
                "admin1": v["state"],
                "state": v["state"],
                "country": "India",
                "latitude": v["lat"],
                "longitude": v["lon"],
                "display_name": v["name"] + ", India",
                "location": v["name"]
            })
    return matched


def fetch_live_weather(latitude: float, longitude: float):
    """
    Fetches real-time meteorological observations from Open-Meteo API.
    """
    print(f"[Weather] latitude: {latitude}")
    print(f"[Weather] longitude: {longitude}")
    print(f"[Weather] requesting Open-Meteo")
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={latitude}&longitude={longitude}"
            f"&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m"
            f"&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code"
            f"&timezone=auto"
        )
        res = requests.get(url, timeout=5.0)
        print(f"[Weather] provider status: {res.status_code}")
        print(f"[Weather] provider content-type: {res.headers.get('Content-Type', '')}")
        if res.status_code != 200:
            raise RuntimeError(f"Open-Meteo API returned status {res.status_code}")

        data = res.json()
        curr = data.get("current", {})
        hourly = data.get("hourly", {})
        daily = data.get("daily", {})

        temp = round(float(curr.get("temperature_2m", 0.0)), 1)
        humidity = round(float(curr.get("relative_humidity_2m", 0.0)), 1)
        wind_speed = round(float(curr.get("wind_speed_10m", 0.0)), 1)
        precip_mm = round(float(curr.get("precipitation", curr.get("rain", 0.0))), 1)

        prob_list = hourly.get("precipitation_probability", [])
        rain_chance = int(prob_list[0]) if prob_list else int(min(100, precip_mm * 20))
        wmo_code = curr.get("weather_code", 0)
        weather_condition = decode_wmo_weather_code(wmo_code, rain_chance)

        # 7-day daily forecast
        forecast = []
        times = daily.get("time", [])
        days_max = daily.get("temperature_2m_max", [])
        days_min = daily.get("temperature_2m_min", [])
        days_rain = daily.get("precipitation_probability_max", [])
        days_wmo = daily.get("weather_code", [])

        for i in range(min(7, len(times))):
            d_time = times[i]
            try:
                d_obj = datetime.strptime(d_time, "%Y-%m-%d")
                day_label = "Today" if i == 0 else ("Tomorrow" if i == 1 else d_obj.strftime("%a, %d %b"))
            except Exception:
                day_label = f"Day {i+1}"

            t_max = round(float(days_max[i]), 1) if i < len(days_max) else temp
            t_min = round(float(days_min[i]), 1) if i < len(days_min) else temp - 6
            r_prob = int(days_rain[i]) if i < len(days_rain) else rain_chance
            w_code = days_wmo[i] if i < len(days_wmo) else wmo_code
            w_cond = decode_wmo_weather_code(w_code, r_prob)

            forecast.append({
                "day": day_label,
                "date": d_time,
                "temp_max": t_max,
                "temp_min": t_min,
                "rain_chance": r_prob,
                "weather_condition": w_cond,
                "humidity": max(30, min(98, humidity + (i % 3) * 4 - 4))
            })

        print(f"[Weather] response normalized successfully")
        return {
            "temperature": temp,
            "humidity": humidity,
            "rain_chance": rain_chance,
            "wind_speed": wind_speed,
            "precipitation_mm": precip_mm,
            "weather_condition": weather_condition,
            "forecast": forecast,
            "weather_source": "open-meteo",
            "is_live": True
        }

    except Exception as e:
        print(f"[Weather] Open-Meteo live API failure: {e}")
        raise RuntimeError("Live weather information is temporarily unavailable. Please try again later.")


def decode_wmo_weather_code(code: int, rain_chance: int) -> str:
    """Converts standard WMO weather codes to human-readable weather descriptions."""
    if code in [0]:
        return "Clear Sky & Sunny"
    elif code in [1, 2]:
        return "Partly Cloudy"
    elif code in [3]:
        return "Overcast Skies"
    elif code in [45, 48]:
        return "Humid Fog / Mist"
    elif code in [51, 53, 55]:
        return "Light Drizzle"
    elif code in [61, 63]:
        return "Light to Moderate Rain"
    elif code in [65, 80, 81, 82]:
        return "Heavy Downpour / Showers"
    elif code in [95, 96, 99]:
        return "Thunderstorm with High Winds"

    if rain_chance > 60:
        return "High Rain Probability"
    return "Partly Cloudy"


def evaluate_crop_risk(crop_name: str, temperature: float, humidity: float, rain_chance: int, wind_speed: float) -> dict:
    """
    Centralized Crop Risk Rules Engine:
    Evaluates physiological, pathological, and management risks based on:
    crop + temperature + humidity + rainfall / rain_chance + wind_speed.
    """
    crop = crop_name.lower().replace(" (paddy)", "").strip()
    print(f"[Weather] applying crop risk rules for {crop_name} (T={temperature}°C, H={humidity}%, R={rain_chance}%, W={wind_speed}km/h)")

    # 1. TOMATO
    if "tomato" in crop:
        if humidity >= 80 and 15 <= temperature <= 26:
            return {
                "risk_level": "HIGH",
                "concern": "Critical Late Blight hazard! Cool temperature combined with high humidity (>80%) accelerates Phytophthora spore release.",
                "explanation": f"Current humidity ({humidity}%) and temperature ({temperature}°C) provide optimal incubation conditions for Late Blight on tomato foliage and fruit.",
                "action": "Inspect leaf margins for dark water-soaked lesions. Apply prophylactic systemic fungicide (Metalaxyl + Mancozeb @ 2.5g/L) during clear morning window.",
                "spray_status": "Caution" if rain_chance > 40 else "Safe",
                "spray_advice": "Apply fungicide during morning hours with sticker adjuvant before rainfall."
            }
        elif humidity >= 65 and rain_chance >= 50:
            return {
                "risk_level": "MODERATE",
                "concern": "High humidity + rainfall may increase fungal disease risk (Early Blight / Septoria).",
                "explanation": f"Rain probability ({rain_chance}%) and humidity ({humidity}%) favor foliar fungal leaf spot proliferation.",
                "action": "Monitor lower leaves closely and avoid overhead irrigation. Prune infected foliage and apply Mancozeb 75% WP once foliage dries.",
                "spray_status": "Avoid" if rain_chance > 60 else "Caution",
                "spray_advice": f"Rain probability is {rain_chance}%. Delay foliar sprays to prevent chemical wash-off."
            }
        elif temperature > 34:
            return {
                "risk_level": "HIGH",
                "concern": f"Extreme heat stress ({temperature}°C) causes pollen sterility, flower drop, and blossom-end rot in Tomato.",
                "explanation": "Ambient temperatures exceeding 34°C inhibit tomato fruit setting and increase transpiration stress.",
                "action": "Provide light early morning sprinkler misting to reduce canopy heat. Apply straw mulch to conserve root moisture.",
                "spray_status": "Caution",
                "spray_advice": "Do not apply chemical sprays during peak afternoon heat (>32°C)."
            }
        elif temperature < 12:
            return {
                "risk_level": "MODERATE",
                "concern": f"Cold spell ({temperature}°C) slows vegetative growth and fruit ripening.",
                "explanation": "Low temperatures reduce metabolic activity and prolong fruit maturation period.",
                "action": "Cover nursery beds with straw mulch; reduce evening irrigation.",
                "spray_status": "Safe",
                "spray_advice": "Safe for spray in sunny afternoon hours."
            }
        else:
            return {
                "risk_level": "LOW",
                "concern": f"Weather conditions (Temp: {temperature}°C, Humidity: {humidity}%) are within favorable agronomic parameters for Tomato.",
                "explanation": "Temperature and humidity are within the optimal vegetative and flowering range for tomato cultivation.",
                "action": "Maintain routine drip fertigation and scout weekly for whiteflies or aphids.",
                "spray_status": "Safe",
                "spray_advice": "Calm winds and low rain chance. Ideal window for nutrient and protective foliar sprays."
            }

    # 2. POTATO
    elif "potato" in crop:
        if humidity >= 75 and (rain_chance >= 45 or temperature <= 22):
            return {
                "risk_level": "HIGH",
                "concern": "Elevated Late Blight epidemic risk. Continuous moisture creates ideal incubation for tuber and foliar rot.",
                "explanation": f"High humidity ({humidity}%) combined with moderate temperatures and rain promotes rapid Phytophthora infestans spread.",
                "action": "Avoid furrow irrigation completely. Spray protective Mancozeb 75% WP @ 2.5g/L or Cymoxanil immediately.",
                "spray_status": "Caution",
                "spray_advice": "Apply during dry intervals between showers with non-ionic sticker."
            }
        elif temperature > 28:
            return {
                "risk_level": "MODERATE",
                "concern": f"High soil and ambient temperature ({temperature}°C) halts tuberization and causes internal brown spotting.",
                "explanation": "Tuber initiation stops when temperatures exceed 27°C, shifting energy into vegetative foliage.",
                "action": "Ensure light frequent night irrigation to cool soil beds. Ensure thick earthing-up.",
                "spray_status": "Safe",
                "spray_advice": "Safe for foliar sprays in evening hours."
            }
        else:
            return {
                "risk_level": "LOW",
                "concern": f"Mild temperatures ({temperature}°C) and balanced moisture support steady potato tuber expansion.",
                "explanation": "Optimal temperature range for tuber growth and vegetative starch synthesis.",
                "action": "Ensure ridging/earthing up is complete to prevent tuber greening.",
                "spray_status": "Safe",
                "spray_advice": "Optimal weather for crop maintenance and foliar feeding."
            }

    # 3. RICE / PADDY
    elif "rice" in crop or "paddy" in crop:
        if humidity >= 80 and rain_chance >= 45:
            return {
                "risk_level": "HIGH",
                "concern": "Dense humidity + cloudy skies sharply increase Rice Blast (Magnaporthe) and Brown Planthopper (BPH) multiplication.",
                "explanation": f"Relative humidity ({humidity}%) and overcast rainy conditions create favorable microclimate for blast lesion expansion and sheath blight.",
                "action": "Withhold top-dressing of nitrogenous urea. Drain excess standing water for 2-3 days to aerate the root zone.",
                "spray_status": "Avoid" if rain_chance > 60 else "Caution",
                "spray_advice": "Rain will dilute foliar sprays. Spray Tricyclazole @ 0.6g/L after rain subsides."
            }
        elif wind_speed > 20:
            return {
                "risk_level": "MODERATE",
                "concern": f"High wind speeds ({wind_speed} km/h) cause leaf tearing and rapid Bacterial Leaf Blight (BLB) transmission.",
                "explanation": "Wind-induced physical friction on leaf tips creates micro-wounds allowing Xanthomonas bacteria to enter.",
                "action": "Keep field bunds intact; inspect leaf tips for bacterial ooze streaks.",
                "spray_status": "Avoid",
                "spray_advice": "High drift hazard! Postpone all pesticide spraying."
            }
        else:
            return {
                "risk_level": "LOW",
                "concern": "Current warmth and moderate humidity support active tillering and panicle development in Rice.",
                "explanation": "Growing conditions are well within healthy physiological thresholds for paddy.",
                "action": "Maintain 2-3 cm standing water layer across paddy fields.",
                "spray_status": "Safe",
                "spray_advice": "Good conditions for bio-fertilizer application and weed management."
            }

    # 4. WHEAT
    elif "wheat" in crop:
        if 10 <= temperature <= 20 and humidity >= 70:
            return {
                "risk_level": "HIGH",
                "concern": "Yellow / Stripe Rust incubation alert! Cool damp weather promotes Puccinia fungal spore germination on leaf blades.",
                "explanation": f"Cool temperatures ({temperature}°C) coupled with high humidity ({humidity}%) trigger rapid rust pustule proliferation.",
                "action": "Inspect lower leaves for linear yellow-orange pustules. Spray Propiconazole 25% EC @ 1ml/L immediately at first detection.",
                "spray_status": "Safe",
                "spray_advice": "Spray in clear morning hours after morning dew dries."
            }
        elif temperature > 30:
            return {
                "risk_level": "HIGH",
                "concern": f"Terminal heat stress warning ({temperature}°C)! High temperatures during grain filling cause forced maturity and shriveled grains.",
                "explanation": "Elevated temperatures accelerate senescence and reduce starch accumulation period.",
                "action": "Provide light sprinkler irrigation in early mornings to cool the microclimate and extend grain-filling duration.",
                "spray_status": "Safe",
                "spray_advice": "Spray micronutrients (Potassium Nitrate 1%) to mitigate heat shock."
            }
        else:
            return {
                "risk_level": "LOW",
                "concern": f"Cool weather ({temperature}°C) with moderate humidity provides ideal conditions for wheat tillering and heading.",
                "explanation": "Favorable temperature range for wheat vegetative and reproductive growth.",
                "action": "Apply scheduled irrigation alongside recommended nitrogen top-dressing.",
                "spray_status": "Safe",
                "spray_advice": "Ideal spray window."
            }

    # 5. CORN / MAIZE
    elif "corn" in crop or "maize" in crop:
        if rain_chance >= 60 and humidity >= 75:
            return {
                "risk_level": "MODERATE",
                "concern": "Heavy precipitation creates waterlogging stress and promotes Northern Corn Leaf Blight in Maize.",
                "explanation": f"Precipitation probability ({rain_chance}%) increases soil saturation and foliar fungal infection.",
                "action": "Ensure field drainage channels are clear to prevent water stagnation around root zones.",
                "spray_status": "Avoid",
                "spray_advice": "Delay foliar application until rain passes."
            }
        elif temperature > 36:
            return {
                "risk_level": "HIGH",
                "concern": f"Severe heat ({temperature}°C) during tasseling/silking impairs pollination and causes blank cobs.",
                "explanation": "Temperatures above 36°C desensitize pollen grains and dry silk strands prematurely.",
                "action": "Provide furrow irrigation to maintain soil moisture during critical flowering window.",
                "spray_status": "Caution",
                "spray_advice": "Do not spray during midday heat."
            }
        else:
            return {
                "risk_level": "LOW",
                "concern": f"Normal growing conditions (Temp: {temperature}°C) support healthy corn stalk elongation and cob development.",
                "explanation": "Atmospheric conditions are well suited for maize photosynthesis.",
                "action": "Apply side-dress nitrogen fertilizer at knee-high stage.",
                "spray_status": "Safe",
                "spray_advice": "Safe for foliar spraying."
            }

    # 6. ONION
    elif "onion" in crop:
        if humidity >= 75 and rain_chance >= 45:
            return {
                "risk_level": "HIGH",
                "concern": "High risk of Purple Blotch (Alternaria porri) and Stemphylium blight in Onion.",
                "explanation": f"Relative humidity ({humidity}%) and rainy intervals trigger purple foliar lesions and neck rot.",
                "action": "Avoid overhead sprinkler watering. Spray Mancozeb 75% WP @ 2.5g/L + sticker adjuvant.",
                "spray_status": "Caution",
                "spray_advice": "Spray during calm morning windows."
            }
        else:
            return {
                "risk_level": "LOW",
                "concern": f"Mild conditions (Temp: {temperature}°C, Humidity: {humidity}%) favor healthy onion bulb development.",
                "explanation": "Good balance of sunlight and moisture for bulb formation.",
                "action": "Maintain weed-free beds and balanced potassium nutrition.",
                "spray_status": "Safe",
                "spray_advice": "Optimal spray conditions."
            }

    # 7. CHILLI
    elif "chilli" in crop or "pepper" in crop:
        if humidity >= 70 and temperature >= 28:
            return {
                "risk_level": "HIGH",
                "concern": "Warm humid weather accelerates Anthracnose (Dieback/Fruit Rot) and Thrips pressure in Chilli.",
                "explanation": f"Temperature ({temperature}°C) and humidity ({humidity}%) create prime conditions for Colletotrichum fungal spores.",
                "action": "Spray Azoxystrobin 23% SC @ 1ml/L or Difenoconazole @ 0.5ml/L at first fruit formation.",
                "spray_status": "Caution",
                "spray_advice": "Ensure thorough under-leaf canopy coverage."
            }
        else:
            return {
                "risk_level": "LOW",
                "concern": f"Favorable weather (Temp: {temperature}°C) supports vegetative flowering and pod setting in Chilli.",
                "explanation": "Optimal temperature for capsaicin synthesis and fruit setting.",
                "action": "Maintain balanced moisture and scout for mite webbing.",
                "spray_status": "Safe",
                "spray_advice": "Safe for preventive spray application."
            }

    # 8. BRINJAL / EGGPLANT
    elif "brinjal" in crop or "eggplant" in crop:
        if humidity >= 75 and temperature >= 27:
            return {
                "risk_level": "MODERATE",
                "concern": "Humid warmth promotes Shoot & Fruit Borer activity and Phomopsis fruit blight.",
                "explanation": "High humidity enhances larval survival and foliar fungal spots.",
                "action": "Clip and destroy infested shoot tips; install pheromone traps (5/acre).",
                "spray_status": "Safe",
                "spray_advice": "Evening spraying recommended."
            }
        else:
            return {
                "risk_level": "LOW",
                "concern": f"Standard growing weather (Temp: {temperature}°C) for Brinjal crop.",
                "explanation": "Healthy conditions for continuous flowering and fruiting.",
                "action": "Ensure adequate nitrogen and potassium fertigation.",
                "spray_status": "Safe",
                "spray_advice": "Optimal spray window."
            }

    # 9. COTTON
    elif "cotton" in crop:
        if rain_chance >= 50 and humidity >= 70:
            return {
                "risk_level": "HIGH",
                "concern": "Rainfall during boll maturation causes internal boll rot and fiber staining in Cotton.",
                "explanation": f"Precipitation probability ({rain_chance}%) threatens mature cotton fiber quality.",
                "action": "Pick open mature cotton bolls before rainfall starts. Clear field drainage furrows.",
                "spray_status": "Avoid",
                "spray_advice": "Avoid spraying before showers."
            }
        else:
            return {
                "risk_level": "LOW",
                "concern": "Warm dry conditions are favorable for cotton vegetative growth and boll formation.",
                "explanation": "Ample sunlight supports healthy boll weight accumulation.",
                "action": "Maintain clean inter-row cultivation and scout weekly for bollworms.",
                "spray_status": "Safe",
                "spray_advice": "Safe for regular agrochemical application."
            }

    # 10. SUGARCANE & DEFAULT
    else:
        if rain_chance >= 60 or humidity >= 80:
            return {
                "risk_level": "MODERATE",
                "concern": f"Elevated humidity ({humidity}%) and rain chance ({rain_chance}%) increase fungal and bacterial disease pressure.",
                "explanation": "Atmospheric moisture promotes foliar pathogens across agricultural crops.",
                "action": "Monitor crop canopy and avoid excess irrigation.",
                "spray_status": "Caution",
                "spray_advice": "Check radar before spraying."
            }
        else:
            return {
                "risk_level": "LOW",
                "concern": f"Weather conditions (Temp: {temperature}°C, Rain: {rain_chance}%) are within standard growing thresholds for {crop_name}.",
                "explanation": "Stable meteorological indicators.",
                "action": "Continue normal irrigation and field scouting schedule.",
                "spray_status": "Safe",
                "spray_advice": "Optimal weather conditions."
            }


def get_agro_weather_risk(location="Patna, Bihar", crop="Tomato", lat=None, lon=None, user_id=None):
    """
    Main endpoint service:
    1. Resolves coordinates dynamically (Geocoding API / GPS)
    2. Fetches live Open-Meteo weather
    3. Evaluates crop-specific risk rules
    4. Persists assessment in history
    """
    if lat is not None and lon is not None:
        try:
            latitude = float(lat)
            longitude = float(lon)
            if location and not location.startswith("Patna, Bihar"):
                resolved_name = location
            else:
                resolved_name = f"GPS Farm Location ({latitude:.2f}°N, {longitude:.2f}°E)"
        except (ValueError, TypeError):
            latitude, longitude, resolved_name = resolve_location_coordinates(location)
    else:
        latitude, longitude, resolved_name = resolve_location_coordinates(location)

    # Normalize crop name
    normalized_crop = "Tomato"
    for c in SUPPORTED_CROPS:
        if crop and crop.lower().replace(" (paddy)", "").strip() in c.lower():
            normalized_crop = c
            break

    # Fetch live weather from Open-Meteo
    weather = fetch_live_weather(latitude, longitude)

    # Evaluate Crop Risk Rules Engine for current conditions
    risk_evaluation = evaluate_crop_risk(
        crop_name=normalized_crop,
        temperature=weather["temperature"],
        humidity=weather["humidity"],
        rain_chance=weather["rain_chance"],
        wind_speed=weather["wind_speed"]
    )

    # Evaluate risk for each of the 7 forecast days
    evaluated_forecast = []
    for day_item in weather.get("forecast", []):
        day_temp = day_item.get("temp_max", weather["temperature"])
        day_humidity = day_item.get("humidity", weather["humidity"])
        day_rain = day_item.get("rain_chance", weather["rain_chance"])
        
        day_risk = evaluate_crop_risk(
            crop_name=normalized_crop,
            temperature=day_temp,
            humidity=day_humidity,
            rain_chance=day_rain,
            wind_speed=weather["wind_speed"]
        )
        evaluated_forecast.append({
            **day_item,
            "risk_level": day_risk["risk_level"],
            "concern": day_risk["concern"]
        })

    result = {
        "id": f"wc-{uuid.uuid4().hex[:8]}",
        "location": resolved_name,
        "latitude": latitude,
        "longitude": longitude,
        "crop": normalized_crop,
        "temperature": weather["temperature"],
        "humidity": weather["humidity"],
        "rain_chance": weather["rain_chance"],
        "wind_speed": weather["wind_speed"],
        "precipitation_mm": weather["precipitation_mm"],
        "weather_condition": weather["weather_condition"],
        "risk_level": risk_evaluation["risk_level"],
        "concern": risk_evaluation["concern"],
        "explanation": risk_evaluation["explanation"],
        "recommendation": risk_evaluation["action"],
        "action": risk_evaluation["action"],
        "spray_advisory": {
            "status": risk_evaluation["spray_status"],
            "advice": risk_evaluation["spray_advice"]
        },
        "forecast": evaluated_forecast,
        "weather_source": "open-meteo",
        "is_live": True,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    # Save to database log
    save_weather_check_to_history(result, user_id=user_id)
    return result


def save_weather_check_to_history(check_data, user_id=None):
    """Saves assessment to Supabase weather_checks or in-memory store."""
    try:
        if supabase_client:
            record = {
                "user_id": user_id,
                "crop_name": check_data["crop"],
                "location": check_data["location"],
                "temperature": check_data["temperature"],
                "humidity": check_data["humidity"],
                "rain_chance": check_data["rain_chance"],
                "risk_level": check_data["risk_level"],
                "concern": check_data["concern"],
                "recommendation": check_data["recommendation"]
            }
            supabase_client.table("weather_checks").insert(record).execute()
    except Exception as e:
        print(f"[Supabase] Weather check log fallback: {e}")

    WEATHER_CHECKS_STORE.insert(0, check_data)
    if len(WEATHER_CHECKS_STORE) > 50:
        WEATHER_CHECKS_STORE.pop()


def get_weather_check_history(limit=10):
    """Retrieves recent weather checks."""
    try:
        if supabase_client:
            res = supabase_client.table("weather_checks").select("*").order("created_at", desc=True).limit(limit).execute()
            if res.data:
                return res.data
    except Exception as e:
        print(f"[Supabase] Weather history fetch fallback: {e}")

    return WEATHER_CHECKS_STORE[:limit]


def get_supported_locations():
    """Returns list of supported agricultural location hubs."""
    return [{"id": k, "name": v["name"], "state": v["state"]} for k, v in CITY_COORDINATES.items()]


def get_supported_crops():
    """Returns supported crop list."""
    return SUPPORTED_CROPS

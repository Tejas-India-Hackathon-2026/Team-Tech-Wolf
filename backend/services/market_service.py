"""
Market Intelligence & Selling Decision Engine
Provides historical price trend analysis, transparent estimate ranges,
and explainable recommendations (SELL / MONITOR / WAIT) for farmers.
"""
import os
import time
import math
import hashlib
from datetime import datetime, timedelta
from models import supabase_client

# Supported Crops as requested
SUPPORTED_MARKET_CROPS = ["Tomato", "Potato", "Onion", "Wheat", "Rice", "Maize"]

# Major APMC Mandi Hubs
MANDI_LOCATIONS = [
    {"id": "patna", "name": "Patna Mandi", "location": "Patna, Bihar", "state": "Bihar"},
    {"id": "pune", "name": "Pune Mandi (Gultekdi)", "location": "Pune, Maharashtra", "state": "Maharashtra"},
    {"id": "nashik", "name": "Nashik APMC", "location": "Nashik, Maharashtra", "state": "Maharashtra"},
    {"id": "lasalgaon", "name": "Lasalgaon Mandi", "location": "Nashik, Maharashtra", "state": "Maharashtra"},
    {"id": "karnal", "name": "Karnal APMC", "location": "Karnal, Haryana", "state": "Haryana"},
    {"id": "agra", "name": "Agra APMC", "location": "Agra, Uttar Pradesh", "state": "Uttar Pradesh"},
    {"id": "latur", "name": "Latur APMC", "location": "Latur, Maharashtra", "state": "Maharashtra"},
    {"id": "akola", "name": "Akola Mandi", "location": "Akola, Maharashtra", "state": "Maharashtra"},
    {"id": "indore", "name": "Indore APMC", "location": "Indore, Madhya Pradesh", "state": "Madhya Pradesh"}
]

# Baseline price matrix per crop and location (for demo & fallback)
CROP_BASE_PRICES = {
    "Tomato": {
        "Patna, Bihar": {"base": 2200, "trend_slope": 1.08, "volatility": 45},  # +8% rising trend (PPT example)
        "Pune, Maharashtra": {"base": 2150, "trend_slope": 0.94, "volatility": 40},  # -6% falling trend
        "default": {"base": 2180, "trend_slope": 1.04, "volatility": 35}
    },
    "Potato": {
        "Agra, Uttar Pradesh": {"base": 1420, "trend_slope": 1.01, "volatility": 15},  # Stable trend
        "Patna, Bihar": {"base": 1480, "trend_slope": 1.03, "volatility": 20},
        "default": {"base": 1450, "trend_slope": 1.01, "volatility": 18}
    },
    "Onion": {
        "Nashik, Maharashtra": {"base": 2180, "trend_slope": 1.12, "volatility": 65}, # +12% strong rising
        "Patna, Bihar": {"base": 2350, "trend_slope": 1.09, "volatility": 50},
        "default": {"base": 2200, "trend_slope": 1.10, "volatility": 55}
    },
    "Wheat": {
        "Pune, Maharashtra": {"base": 2720, "trend_slope": 1.03, "volatility": 25}, # +3% rising
        "Karnal, Haryana": {"base": 2680, "trend_slope": 1.02, "volatility": 20},
        "Patna, Bihar": {"base": 2640, "trend_slope": 1.02, "volatility": 22},
        "default": {"base": 2690, "trend_slope": 1.02, "volatility": 20}
    },
    "Rice": {
        "Karnal, Haryana": {"base": 4310, "trend_slope": 1.04, "volatility": 45},
        "Patna, Bihar": {"base": 3950, "trend_slope": 1.02, "volatility": 35},
        "default": {"base": 4150, "trend_slope": 1.03, "volatility": 40}
    },
    "Maize": {
        "Latur, Maharashtra": {"base": 2150, "trend_slope": 0.96, "volatility": 30}, # -4% falling trend
        "Patna, Bihar": {"base": 2100, "trend_slope": 0.98, "volatility": 25},
        "default": {"base": 2120, "trend_slope": 0.97, "volatility": 28}
    }
}

DATA_SOURCE_LABEL = "Demo Market Data (Agri-Market Prototype Feed)"

def generate_historical_prices(crop_name, location_name, days=30):
    """
    Generates structured daily historical price series for the specified timeframe.
    """
    # Normalize crop & location
    crop_key = "Tomato"
    for c in SUPPORTED_MARKET_CROPS:
        if crop_name and crop_name.lower() in c.lower():
            crop_key = c
            break

    loc_key = "default"
    for loc, data in CROP_BASE_PRICES.get(crop_key, {}).items():
        if loc.lower() in (location_name or "").lower():
            loc_key = loc
            break

    profile = CROP_BASE_PRICES.get(crop_key, {}).get(loc_key, CROP_BASE_PRICES.get(crop_key, {}).get("default", {"base": 2200, "trend_slope": 1.04, "volatility": 30}))

    current_price = profile["base"]
    trend_slope = profile["trend_slope"]  # overall multiplier over 30 days
    volatility = profile["volatility"]

    # Calculate starting price `days` ago
    start_price = current_price / (1 + (trend_slope - 1) * (days / 30.0))

    # Deterministic daily fluctuation hash seed based on crop & location
    seed = int(hashlib.md5(f"{crop_key}_{location_name}".encode()).hexdigest()[:6], 16)

    series = []
    today = datetime.now()

    for i in range(days):
        day_offset = days - 1 - i
        dt = today - timedelta(days=day_offset)
        progress = i / max(1, days - 1)  # 0 to 1

        # Smooth linear trend progression
        interp_price = start_price + (current_price - start_price) * progress

        # Add realistic micro-market oscillation (sinusoidal + pseudo-noise)
        oscillation = math.sin((i + (seed % 10)) * 0.7) * (volatility * 0.6)
        
        # Last day is exact current price
        if i == days - 1:
            p_val = current_price
        else:
            p_val = round(interp_price + oscillation)

        series.append({
            "date": dt.strftime("%Y-%m-%d"),
            "formatted_date": dt.strftime("%d %b"),
            "price": p_val
        })

    return crop_key, series, profile

def get_market_analysis(crop_name="Tomato", location="Patna Mandi, Bihar", days=30):
    """
    Executes Market Intelligence Decision Engine:
    Calculates 7/15/30-day percentage changes, average/high/low prices,
    transparent estimated ranges, and explainable recommendations (SELL / MONITOR / WAIT).
    """
    try:
        days = int(days)
        if days not in [7, 15, 30]:
            days = 30
    except (ValueError, TypeError):
        days = 30

    crop_key, series, profile = generate_historical_prices(crop_name, location, days=days)

    prices_list = [item["price"] for item in series]
    current_price = prices_list[-1]
    first_price = prices_list[0]

    # Percentage change
    percentage_change = round(((current_price - first_price) / first_price) * 100, 2)

    # High, Low, Average
    high_price = max(prices_list)
    low_price = min(prices_list)
    average_price = round(sum(prices_list) / len(prices_list), 2)

    # Estimated Price Range (Transparent calculation based on slope & volatility)
    if percentage_change >= 4.0:
        trend = "Rising"
        estimated_min = round(current_price * 1.03)
        estimated_max = round(current_price * 1.12)
        recommendation = "MONITOR / WAIT"
        explanation = f"Prices have risen {percentage_change}% over the past {days} days with strong mandi buying demand. Consider monitoring closely or waiting to capture potential peak realization before dispatching full crop volume."
    elif percentage_change <= -3.0:
        trend = "Falling"
        estimated_min = round(current_price * 0.90)
        estimated_max = round(current_price * 0.98)
        recommendation = "SELL"
        explanation = f"Prices have declined {abs(percentage_change)}% over the past {days} days due to heavy harvest arrivals and supply surplus. Selling available produce promptly may prevent further price decay."
    else:
        trend = "Stable"
        estimated_min = round(current_price * 0.97)
        estimated_max = round(current_price * 1.04)
        recommendation = "MONITOR"
        explanation = f"Market is relatively stable with minimal fluctuation ({percentage_change}% over {days} days). Monitor daily mandi arrivals and dispatch produce steadily based on storage feasibility."

    result = {
        "crop": crop_key,
        "location": location,
        "days": days,
        "current_price": current_price,
        "historical_prices": series,
        "percentage_change": percentage_change,
        "average_price": average_price,
        "high_price": high_price,
        "low_price": low_price,
        "estimated_min": estimated_min,
        "estimated_max": estimated_max,
        "trend": trend,
        "recommendation": recommendation,
        "explanation": explanation,
        "data_source": DATA_SOURCE_LABEL,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    return result

def get_all_prices(crop=None, location=None, days=30):
    """Returns price comparison across multiple active mandis."""
    target_crop = crop or "Tomato"
    results = []

    for loc in MANDI_LOCATIONS:
        analysis = get_market_analysis(crop_name=target_crop, location=loc["location"], days=days)
        results.append({
            "id": f"mkt-{loc['id']}",
            "commodity": target_crop,
            "mandi_name": loc["name"],
            "location": loc["location"],
            "state": loc["state"],
            "modal_price": analysis["current_price"],
            "percentage_change": analysis["percentage_change"],
            "trend": analysis["trend"],
            "recommendation": analysis["recommendation"],
            "high_price": analysis["high_price"],
            "low_price": analysis["low_price"],
            "estimated_range": f"₹{analysis['estimated_min']} – ₹{analysis['estimated_max']}"
        })

    return results

def calculate_mandi_arbitrage(commodity="Wheat", quantity_quintals=50, transport_cost_per_km=15):
    """
    Compares prices across nearby mandis and calculates net earnings after deducting logistics.
    """
    distances = {
        "patna": 12,
        "pune": 14,
        "nashik": 65,
        "lasalgaon": 72,
        "karnal": 110,
        "agra": 95,
        "latur": 115,
        "akola": 180,
        "indore": 130
    }

    active_crop = commodity if commodity in SUPPORTED_MARKET_CROPS else "Wheat"
    analysis_list = []

    for loc in MANDI_LOCATIONS[:6]:
        dist = distances.get(loc["id"], 40)
        data = get_market_analysis(crop_name=active_crop, location=loc["location"], days=30)
        rate = data["current_price"]

        gross_revenue = rate * quantity_quintals
        transport_cost = dist * transport_cost_per_km * 2  # Round trip transport
        net_revenue = gross_revenue - transport_cost
        net_rate = round(net_revenue / quantity_quintals, 2) if quantity_quintals else 0

        analysis_list.append({
            "mandi_name": loc["name"],
            "location": loc["location"],
            "modal_price": rate,
            "distance_km": dist,
            "gross_revenue": gross_revenue,
            "estimated_transport": transport_cost,
            "net_revenue": net_revenue,
            "net_effective_price": net_rate,
            "recommendation": "Alternative"
        })

    analysis_list.sort(key=lambda x: x["net_revenue"], reverse=True)
    if analysis_list:
        analysis_list[0]["recommendation"] = "Highest Net Profit (Recommended)"

    return analysis_list

def get_supported_crops():
    """Returns supported market crop list."""
    return SUPPORTED_MARKET_CROPS

def get_supported_locations():
    """Returns supported mandi hubs list."""
    return MANDI_LOCATIONS

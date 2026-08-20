"""
Market Intelligence & Mandi APMC Price Service
Provides commodity spot prices, 7-day trend forecasts, mandi comparison, and profit calculators.
"""

MANDI_PRICE_DATA = [
    {
        "id": "mkt-1",
        "commodity": "Wheat",
        "variety": "Lokwan Standard",
        "mandi_name": "Pune Mandi (Gultekdi)",
        "district": "Pune",
        "state": "Maharashtra",
        "min_price": 2480.00,
        "max_price": 2860.00,
        "modal_price": 2720.00,
        "yesterday_price": 2680.00,
        "price_change_pct": 1.49,
        "price_unit": "₹/Quintal",
        "price_trend": "Bullish",
        "forecast_next_week": 2790.00,
        "demand_index": "High",
        "history_7d": [2620, 2640, 2660, 2650, 2680, 2700, 2720],
        "distance_km": 14
    },
    {
        "id": "mkt-2",
        "commodity": "Wheat",
        "variety": "Sharbati Premium",
        "mandi_name": "Nashik APMC",
        "district": "Nashik",
        "state": "Maharashtra",
        "min_price": 2900.00,
        "max_price": 3450.00,
        "modal_price": 3220.00,
        "yesterday_price": 3150.00,
        "price_change_pct": 2.22,
        "price_unit": "₹/Quintal",
        "price_trend": "Bullish",
        "forecast_next_week": 3310.00,
        "demand_index": "Very High",
        "history_7d": [3080, 3100, 3120, 3140, 3150, 3190, 3220],
        "distance_km": 65
    },
    {
        "id": "mkt-3",
        "commodity": "Soybean",
        "variety": "Yellow Grade-A",
        "mandi_name": "Latur APMC",
        "district": "Latur",
        "state": "Maharashtra",
        "min_price": 4350.00,
        "max_price": 4890.00,
        "modal_price": 4650.00,
        "yesterday_price": 4620.00,
        "price_change_pct": 0.65,
        "price_unit": "₹/Quintal",
        "price_trend": "Stable",
        "forecast_next_week": 4680.00,
        "demand_index": "Moderate",
        "history_7d": [4590, 4600, 4630, 4620, 4620, 4640, 4650],
        "distance_km": 110
    },
    {
        "id": "mkt-4",
        "commodity": "Tomato",
        "variety": "Hybrid Red",
        "mandi_name": "Narayangaon Mandi",
        "district": "Pune",
        "state": "Maharashtra",
        "min_price": 1850.00,
        "max_price": 2550.00,
        "modal_price": 2150.00,
        "yesterday_price": 2280.00,
        "price_change_pct": -5.70,
        "price_unit": "₹/Quintal",
        "price_trend": "Bearish",
        "forecast_next_week": 1950.00,
        "demand_index": "High Inflow (Surplus)",
        "history_7d": [2450, 2400, 2350, 2300, 2280, 2220, 2150],
        "distance_km": 42
    },
    {
        "id": "mkt-5",
        "commodity": "Onion",
        "variety": "Nashik Red Export",
        "mandi_name": "Lasalgaon Mandi",
        "district": "Nashik",
        "state": "Maharashtra",
        "min_price": 1750.00,
        "max_price": 2450.00,
        "modal_price": 2180.00,
        "yesterday_price": 2050.00,
        "price_change_pct": 6.34,
        "price_unit": "₹/Quintal",
        "price_trend": "Bullish",
        "forecast_next_week": 2360.00,
        "demand_index": "Very High",
        "history_7d": [1880, 1920, 1960, 2000, 2050, 2110, 2180],
        "distance_km": 72
    },
    {
        "id": "mkt-6",
        "commodity": "Cotton",
        "variety": "Medium Staple (Shankar-6)",
        "mandi_name": "Akola Mandi",
        "district": "Akola",
        "state": "Maharashtra",
        "min_price": 6900.00,
        "max_price": 7650.00,
        "modal_price": 7320.00,
        "yesterday_price": 7300.00,
        "price_change_pct": 0.27,
        "price_unit": "₹/Quintal",
        "price_trend": "Stable",
        "forecast_next_week": 7350.00,
        "demand_index": "Moderate",
        "history_7d": [7250, 7270, 7280, 7300, 7300, 7310, 7320],
        "distance_km": 190
    },
    {
        "id": "mkt-7",
        "commodity": "Rice (Paddy)",
        "variety": "Basmati 1121 Pusa",
        "mandi_name": "Karnal Mandi",
        "district": "Karnal",
        "state": "Haryana",
        "min_price": 3950.00,
        "max_price": 4550.00,
        "modal_price": 4310.00,
        "yesterday_price": 4200.00,
        "price_change_pct": 2.62,
        "price_unit": "₹/Quintal",
        "price_trend": "Bullish",
        "forecast_next_week": 4440.00,
        "demand_index": "High",
        "history_7d": [4120, 4150, 4180, 4200, 4200, 4260, 4310],
        "distance_km": 140
    },
    {
        "id": "mkt-8",
        "commodity": "Potato",
        "variety": "Kufri Jyoti",
        "mandi_name": "Agra APMC",
        "district": "Agra",
        "state": "Uttar Pradesh",
        "min_price": 1150.00,
        "max_price": 1600.00,
        "modal_price": 1420.00,
        "yesterday_price": 1390.00,
        "price_change_pct": 2.16,
        "price_unit": "₹/Quintal",
        "price_trend": "Stable",
        "forecast_next_week": 1450.00,
        "demand_index": "Normal",
        "history_7d": [1340, 1360, 1370, 1380, 1390, 1400, 1420],
        "distance_km": 95
    }
]

def get_all_prices(commodity=None, state=None, search=None):
    """Filter market prices by commodity name, state, or search text."""
    data = MANDI_PRICE_DATA
    if commodity and commodity != "All":
        data = [item for item in data if item["commodity"].lower() == commodity.lower()]
    if state and state != "All":
        data = [item for item in data if item["state"].lower() == state.lower()]
    if search:
        s = search.lower().strip()
        data = [item for item in data if s in item["commodity"].lower() or s in item["mandi_name"].lower() or s in item["district"].lower()]
    return data

def calculate_mandi_arbitrage(commodity, quantity_quintals=50, transport_cost_per_km=15):
    """
    Compares prices across nearby mandis and calculates net earnings after logistics.
    """
    matches = [item for item in MANDI_PRICE_DATA if item["commodity"].lower() == commodity.lower()]
    if not matches:
        matches = [item for item in MANDI_PRICE_DATA if item["commodity"].lower() == "wheat"]
        
    analysis = []
    for m in matches:
        gross_revenue = m["modal_price"] * quantity_quintals
        transport_cost = m["distance_km"] * transport_cost_per_km * 2 # Round trip transport
        net_revenue = gross_revenue - transport_cost
        net_rate_per_quintal = net_revenue / quantity_quintals if quantity_quintals else 0
        
        analysis.append({
            "mandi_name": m["mandi_name"],
            "district": m["district"],
            "modal_price": m["modal_price"],
            "distance_km": m["distance_km"],
            "gross_revenue": gross_revenue,
            "estimated_transport": transport_cost,
            "net_revenue": net_revenue,
            "net_effective_price": round(net_rate_per_quintal, 2),
            "recommendation": "Best Profit Margin" if m == matches[0] else "Alternative"
        })
        
    analysis.sort(key=lambda x: x["net_revenue"], reverse=True)
    if analysis:
        analysis[0]["recommendation"] = "Highest Net Profit (Recommended)"
        
    return analysis

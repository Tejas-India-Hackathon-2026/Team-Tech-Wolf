# AGRO-SMART Market Intelligence

**Data-Driven APMC Commodity Analytics, Historical Trends & Selling Decision Support**

---

## 1. Purpose

Smallholder farmers often suffer substantial revenue loss due to localized price volatility, lack of visibility into regional APMC mandi rates, and uncalculated logistics costs. 

The **Market Intelligence** module in AGRO-SMART equips farmers with historical commodity price trends, estimated short-term realization ranges, regional mandi price comparisons, and transparent, rule-based decision support (**SELL**, **MONITOR**, **WAIT**) to maximize net crop profitability.

---

## 2. Current Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│          Frontend Market UI (MarketIntelligencePage.jsx)    │
│  - Crop, Mandi & Timeframe (7/15/30-Day) Selectors          │
│  - Interactive SVG Price Trend Charts with Hover Tooltips   │
│  - Mandi Price Comparison & Logistics Margin Calculator     │
└──────────────────────────────┬──────────────────────────────┘
                               │ GET /api/market/analysis & /arbitrage
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Frontend Service Layer (marketService.js)          │
│  - Centralized HTTP requests via api.js                     │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST GET (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Flask Market Blueprint (market_routes.py)          │
│  - Query parameter validation, sanitization & route mapping │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Market Service Layer (market_service.py)           │
│  - generate_historical_prices()  • get_market_analysis()    │
│  - calculate_mandi_arbitrage()   • get_all_prices()         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Data Engine & Decision Logic Layer                 │
│  - Baseline commodity pricing matrices & slope multipliers  │
│  - Historical series generator (7, 15, 30 days)             │
│  - Rule-based recommendation engine (SELL / MONITOR / WAIT) │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Market Data Flow

```text
Farmer Selects Crop, Mandi & Timeframe (e.g. Tomato, Patna Mandi, 30 Days)
                               │
                               ▼
Frontend sends GET request to /api/market/analysis?crop=Tomato&location=Patna...&days=30
                               │
                               ▼
Flask route validates parameters and delegates to market_service.py
                               │
                               ▼
Service builds deterministic daily price series using baseline modal rates & trend slope
                               │
                               ▼
Decision engine computes percentage change, high/low/average, and price bounds
                               │
                               ▼
Service evaluates threshold logic to assign recommendation (SELL / MONITOR / WAIT)
                               │
                               ▼
Structured JSON payload returned to frontend
                               │
                               ▼
React renders KPI metric cards, interactive SVG line chart, and advisory card
```

---

## 4. Supported Market Information

The current implementation supports structured records across major agricultural commodities and mandi centers:

### Supported Crops
- **Tomato**, **Potato**, **Onion**, **Wheat**, **Rice**, **Maize**

### Supported Mandi Hubs
- **Patna Mandi** (Bihar), **Pune Mandi - Gultekdi** (Maharashtra), **Nashik APMC** (Maharashtra), **Lasalgaon Mandi** (Maharashtra), **Karnal APMC** (Haryana), **Agra APMC** (Uttar Pradesh), **Latur APMC** (Maharashtra), **Akola Mandi** (Maharashtra), **Indore APMC** (Madhya Pradesh).

### Output Data Fields
- **`crop`**: Selected commodity name.
- **`location` / `mandi_name`**: Target APMC market center and state.
- **`current_price`**: Latest modal spot rate in ₹ per quintal.
- **`percentage_change`**: Net price change over the selected historical period.
- **`high_price` & `low_price`**: Peak realization and lowest floor rate across the timeframe.
- **`average_price`**: Mean modal price over the period.
- **`estimated_min` & `estimated_max`**: Transparent projected price range.
- **`trend`**: Directional classification (`Rising`, `Falling`, `Stable`).
- **`recommendation`**: Decision-support signal (`SELL`, `MONITOR`, `MONITOR / WAIT`).
- **`explanation`**: Agronomic and supply-demand rationale.
- **`historical_prices`**: Array of `{date, formatted_date, price}` daily observations.

---

## 5. Price Trend Analysis

Farmers can toggle between three discrete analysis windows:
- **7 Days (`7D`)**: Short-term weekly momentum.
- **15 Days (`15D`)**: Bi-weekly arrival trend.
- **30 Days (`30D`)**: Monthly macroeconomic seasonal curve.

The system computes the net percentage change:
$$\text{Percentage Change} = \frac{\text{Current Price} - \text{Initial Price}}{\text{Initial Price}} \times 100$$

---

## 6. Market Recommendation Logic

The decision-support engine evaluates trend slope thresholds to generate actionable guidance:

| Trend Condition | Percentage Change | Decision Output | Agronomic & Market Rationale |
| :--- | :--- | :--- | :--- |
| **Rising Demand** | $\ge +4.0\%$ | **`MONITOR / WAIT`** | Strong buying interest with upward momentum. Farmers are advised to hold or monitor daily arrivals to capture peak realization before dispatching full crop volume. |
| **Falling / Surplus** | $\le -3.0\%$ | **`SELL`** | Heavy mandi arrivals and supply surplus causing price decay. Farmers are advised to liquidate ready stock promptly to prevent further losses. |
| **Stable / Sideways**| Between $-3.0\%$ and $+4.0\%$ | **`MONITOR`** | Range-bound market with minimal volatility. Farmers should dispatch steadily based on storage feasibility and shelf-life. |

> [!NOTE]
> Recommendations provide analytical decision support based on observed historical patterns and do not guarantee future commodity price outcomes.

---

## 7. Mandi Comparison & Logistics Arbitrage Calculator

The application includes a built-in **Logistics Margin & Mandi Arbitrage Engine** (`/api/market/arbitrage`):
- **Input Parameters**: Total harvest quantity to sell (Quintals) and round-trip transportation freight rate (₹ / km).
- **Logistics Deduction**:
  $$\text{Net Revenue} = (\text{Mandi Spot Rate} \times \text{Quantity}) - (\text{Distance km} \times \text{Transport Rate} \times 2)$$
- **Arbitrage Sorting**: Compares net realization across nearby regional mandis to identify the highest net-profit market after deducting trucking costs, preventing farmers from travelling to distant mandis with deceptive nominal prices.

---

## 8. Charts and Visualization

- **Lightweight SVG Architecture**: Built with native, responsive SVG paths (`<path d="..." />`, `<circle />`, `<linearGradient />`), eliminating heavy external chart dependencies.
- **Interactive Tooltips**: Hovering over any data point displays the exact historical date and recorded ₹/quintal rate.
- **Color-Coded Visual Identity**: Green gradients for positive market trends, red for downward trajectories, and amber for stable conditions.

---

## 9. Real Data vs. Demo Fallback Mode

- **Current Prototype State**: The module currently operates using realistic, seeded agricultural pricing matrices (`CROP_BASE_PRICES`) calibrated to historical APMC mandi trading ranges in Maharashtra, Bihar, Haryana, and Uttar Pradesh.
- **Data Source Label**: All API responses explicitly carry `"data_source": "Demo Market Data (Agri-Market Prototype Feed)"` for complete transparency.
- **Future Live API Integration**: The modular service architecture is structured to seamlessly plug into the Government of India's **Agmarknet / Data.gov.in API** (`DATA_GOV_API_KEY`) without modifying frontend views or route contracts.

---

## 10. Business Value & Agricultural Impact

- **Transparency in Price Discovery**: Eliminates middlemen information asymmetry by giving smallholders direct access to multi-mandi spot prices.
- **Logistics Cost Awareness**: Prevents unprofitable transportation decisions through real-time freight deduction.
- **Optimized Harvest Dispatch**: Helps farmers avoid distress selling during temporary market gluts.

---

## 11. Current Limitations

1. Relies on structured baseline price models rather than real-time daily Agmarknet scraping.
2. Freight calculation uses distance estimates rather than dynamic toll and live diesel fuel indexation.
3. Does not yet incorporate daily mandi arrival volume metrics (quintals arrived per day).

---

## 12. Future Improvements (Roadmap)

1. **Live Agmarknet / e-NAM API Sync**: Ingest real-time daily modal rates directly from national APMC mandi servers.
2. **Machine Learning Price Forecasting**: Implement time-series forecasting (Prophet / ARIMA / LSTM) for 15-day forward price projections.
3. **Arrival Volume vs. Price Correlation**: Model supply elasticity by plotting daily truck arrival volume against spot prices.
4. **Automated WhatsApp / SMS Price Alerts**: Notify farmers when their target commodity crosses a pre-set strike price at nearby mandis.
5. **Multilingual Audio Summaries**: Voice advisories in Hindi, Marathi, and Punjabi explaining daily market trends.

---

## 13. Jury Technical Explanation

> *"How does your Market Intelligence module work?"*

```text
Input (Crop, Mandi, Timeframe)
          │
          ▼
REST API (/api/market/analysis)
          │
          ▼
Service Data Engine (generate_historical_prices)
          │
          ▼
Trend Analytics (Percentage Change, High, Low, Moving Average)
          │
          ▼
Rule-Based Decision Engine (SELL / MONITOR / WAIT Evaluation)
          │
          ▼
Logistics Arbitrage Filter (Freight Cost Subtraction)
          │
          ▼
Frontend Presentation (Interactive SVG Line Chart & KPI Cards)
```

---

## 14. Important Disclaimer

> [!IMPORTANT]
> **Decision Support Only**: Market intelligence, historical trends, and price range estimates provide preliminary analytical decision support based on past trading patterns. Commodity prices are subject to unpredictable macroeconomic shocks, weather disruptions, and export/import policies. Farmers should exercise independent judgement and verify on-ground mandi conditions prior to dispatching produce.

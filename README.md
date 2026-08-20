# AGRO-SMART
**Smart Farming. Smarter Decisions. Better Harvests.**

---

## 📖 Project Overview

**AGRO-SMART** is an integrated AI-powered digital agriculture platform designed to empower Indian farmers, rural communities, and agronomists with timely data-driven insights, localized pathology support, on-demand farm mechanization, and transparent market economics.

### The Problem It Solves
Smallholder farmers frequently face fragmented agricultural tools, inaccessible expert diagnostics, sudden meteorological crop damage, prohibitive equipment ownership costs, and volatile commodity price discovery. AGRO-SMART consolidates these essential agricultural workflows into a single, intuitive platform to reduce crop losses and improve farm profitability.

### Four Core Modules
1. **AI Crop Disease Detection & Auto Identification**:
   - Multimodal vision analysis supporting Auto Crop Detection across major crops (*Tomato, Potato, Rice, Wheat, Cotton, Corn/Maize*).
   - Strict non-plant image validation, image quality checks, severity rating, observable signs, actionable remedies, cultural prevention steps, and regional Hindi advisory (*किसान सलाह*).
2. **Weather Risk Intelligence**:
   - Converts raw meteorological forecasts (temperature, relative humidity, precipitation probability, wind) into crop-specific agronomic risk indicators.
   - Evaluates fungal incubation risk windows, heat stress thresholds, and 7-day foliar spray suitability conditions.
3. **Machinery Rental Marketplace ("Uber for Tractors")**:
   - Location-aware equipment rental marketplace connecting smallholders with local tractor, harvester, rotavator, and cultivator owners.
   - Dynamic hourly rate calculation, status synchronization (`Pending`, `Accepted`, `Completed`, `Cancelled`), and double-booking prevention.
4. **Market Intelligence & Price Analytics**:
   - Real-time APMC mandi spot prices, historical price trend graphs (7, 15, 30 days), freight arbitrage comparison, and explainable **SELL / HOLD** recommendations.

> [!NOTE]
> **Hackathon MVP Status**: AGRO-SMART is currently developed as a hackathon MVP prototype demonstrating full-stack workflow integration across vision AI, weather intelligence, equipment sharing, and market analytics.

> [!IMPORTANT]
> **Safety & AI Decision Support Disclaimer**: AI-generated pathology detections and predictive insights provide preliminary decision support only and do not constitute a guaranteed agronomic diagnosis. Farmers should consult local Krishi Vigyan Kendra (KVK) experts or agricultural extension officers prior to applying major chemical treatments or operational interventions.

---

## 🏗️ Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                 React + Vite Frontend (SPA)                 │
│  - Light Agriculture Theme (Tailored HSL & Contrast tokens) │
│  - Centralized Service Layer (frontend/src/services/)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON / multipart/form-data
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Flask REST API (Python 3)                   │
│  - Input validation, safe CORS & error sanitization         │
│  - Multi-crop pathology & crop-risk rules engines           │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│  Live Open-Meteo & AI APIs  │ │    Supabase PostgreSQL      │
│  - Hyperlocal agro weather  │ │  - disease_scans            │
│  - Pathology classifiers    │ │  - weather_checks           │
│                             │ │  - machinery & bookings     │
│                             │ │  - market_prices            │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide React icons, CSS3 Light Agriculture Theme Design System.
- **Backend**: Python 3, Flask, Flask-CORS, python-dotenv, Requests.
- **Database**: Supabase (PostgreSQL 15) with relational foreign keys and indexed queries.
- **APIs**: Open-Meteo Agro-Weather API, AI Plant Pathology Vision Engine, APMC Mandi price feeds.

---

## 📁 Repository Structure

```text
agro-smart/
├── frontend/                       # React + Vite Client Application
│   ├── public/                     # Static icons & public assets
│   ├── src/
│   │   ├── components/             # Reusable UI components (Navbar, Footer, Modal, Skeleton)
│   │   ├── pages/                  # 4 Core Service Views + Home Dashboard
│   │   │   ├── HomePage.jsx
│   │   │   ├── DiseaseDetectionPage.jsx
│   │   │   ├── WeatherIntelligencePage.jsx
│   │   │   ├── MachineryRentalPage.jsx
│   │   │   └── MarketIntelligencePage.jsx
│   │   ├── services/               # Centralized API network client wrappers
│   │   │   ├── api.js
│   │   │   ├── diseaseService.js
│   │   │   ├── weatherService.js
│   │   │   ├── machineryService.js
│   │   │   └── marketService.js
│   │   ├── hooks/                  # Custom hooks (Geolocation)
│   │   ├── utils/                  # Currency, date, and unit formatters
│   │   ├── index.css               # Light Agriculture Theme CSS design tokens
│   │   └── App.jsx                 # Routing & global layout
│   ├── package.json
│   └── vite.config.js
│
├── backend/                        # Python Flask REST API
│   ├── routes/                     # Blueprint Route Controllers
│   │   ├── disease_routes.py
│   │   ├── weather_routes.py
│   │   ├── machinery_routes.py
│   │   └── market_routes.py
│   ├── services/                   # Core Business Logic & Rule Engines
│   │   ├── disease_service.py
│   │   ├── weather_service.py
│   │   ├── machinery_service.py
│   │   └── market_service.py
│   ├── models/                     # Supabase DB client connector
│   │   └── __init__.py
│   ├── utils/                      # Standardized response formatters
│   │   └── helpers.py
│   ├── app.py                      # Flask Application Entry Point
│   ├── requirements.txt            # Python dependencies
│   └── .env.example
│
├── database/                       # Database Setup & Seed Data
│   ├── schema.sql                  # Consolidated PostgreSQL schema with indexes
│   └── seed.sql                    # Initial seed data for demo presentation
│
├── .env.example                    # Global environment template
├── .gitignore
└── README.md
```

---

## 🚀 Local Installation & Setup

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.9 or higher
- **npm** or **yarn**

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Start Flask Server (Runs on port 5000)
python app.py
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server (Runs on http://localhost:5173)
npm run dev
```

---

## 🔐 Environment Variables

Create `.env` inside the `backend/` directory or root based on `.env.example`:

| Variable | Description | Required | Default |
|---|---|---|---|
| `PORT` | Flask server port | No | `5000` |
| `FLASK_ENV` | Environment mode | No | `development` |
| `SUPABASE_URL` | Supabase project URL | Optional (Demo fallback enabled) | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | Supabase anon/service key | Optional (Demo fallback enabled) | `your-key` |
| `WEATHER_API_KEY` | Weather API key | Optional (Open-Meteo default) | - |
| `DISEASE_API_KEY` | Vision model API key | Optional (Local engine default) | - |
| `VITE_API_BASE_URL` | Frontend API Proxy target | No | `http://localhost:5000/api` |

---

## 🗄️ Supabase Database Setup

1. Create a new PostgreSQL project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run the contents of [`database/schema.sql`](database/schema.sql) to create tables, constraints, and indexes.
4. Run the contents of [`database/seed.sql`](database/seed.sql) to load initial verified agricultural records.
5. Copy your project's URL and anon key into `backend/.env`.

---

## 📡 REST API Reference

| Service | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Backend status & service configuration flags |
| **Disease** | `POST` | `/api/disease/analyze` | Multi-crop leaf photo disease diagnosis (`multipart/form-data`) |
| **Disease** | `GET` | `/api/disease/history` | Retrieve past diagnostic scan logs |
| **Disease** | `GET` | `/api/disease/crops` | List supported crops for pathology screening |
| **Weather** | `GET` | `/api/weather/risk` | Crop-specific weather risk, concern, action, spray window |
| **Weather** | `GET` | `/api/weather/history` | Historical weather check records |
| **Machinery**| `GET` | `/api/machinery` | Search & filter equipment by location, type, distance, price |
| **Machinery**| `GET` | `/api/machinery/:id` | Single equipment details & owner contact |
| **Machinery**| `POST`| `/api/machinery/bookings` | Submit booking with server-side rate calculation |
| **Machinery**| `GET` | `/api/machinery/bookings` | Retrieve user bookings log |
| **Machinery**| `PATCH`| `/api/machinery/bookings/:id/status` | Update booking status (`Pending`, `Accepted`, etc.) |
| **Market** | `GET` | `/api/market/analysis` | Multi-day trend curve, estimated range, and **SELL/MONITOR/WAIT** advice |
| **Market** | `GET` | `/api/market/prices` | APMC mandi spot prices across regional hubs |
| **Market** | `GET` | `/api/market/arbitrage` | Logistics and freight net profit margin calculator |

---

## ⚠️ Important Disclaimers

1. **Disease Detection**: AI model provides preliminary decision support only — not a guaranteed diagnosis. Consult certified agricultural universities or extension officers for critical crop protection decisions.
2. **Weather Risk**: Meteorological advisories are generated based on agro-climatic threshold models. Hyperlocal micro-climates may vary.
3. **Market Intelligence**: Estimated price ranges and trend signals are computed from historical APMC spot movements and do not represent guaranteed future auction rates.
4. **Demo Data**: When external live government mandi feeds or cloud databases are unconfigured during local hackathon demos, AGRO-SMART clearly displays the *"Demo Market Data"* label.

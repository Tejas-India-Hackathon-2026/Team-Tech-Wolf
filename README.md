# AGRO-SMART
**Smart Farming. Smarter Decisions. Better Harvests.**

> An integrated AI-powered digital agriculture platform built for Indian farmers, agribusinesses, and agronomists to optimize crop health, mitigate meteorological risks, access farm mechanization on-demand, and make profitable selling decisions.

---

## 🌾 The 4 Core Agricultural Services

1. **AI Crop Disease Detection**
   - Upload leaf photos to diagnose bacterial, fungal, or viral diseases across multiple crops (**Tomato, Potato, Rice, Wheat, Cotton, Corn**).
   - Structured pathology reports featuring confidence levels, severity classifications, actionable field steps, cultural prevention tips, and Hindi advisory.
   - *Safety Disclaimer: Preliminary decision support only — consult agricultural extension officers for confirmation.*

2. **Crop-Specific Weather Risk Alerts**
   - Translates raw meteorological readings (temperature, humidity, precipitation probability, wind speed) into crop-specific agronomic meaning.
   - Reusable rules engine evaluating fungal incubation thresholds, terminal heat stress, and 7-day foliar spray suitability windows.

3. **Farm Machinery Rental ("Uber for Tractors")**
   - Location-aware marketplace connecting smallholder farmers with nearby tractor, harvester, rotavator, cultivator, and seed drill owners.
   - Dynamic hours-to-cost calculation, server-side rate verification, and complete booking management (`Pending`, `Accepted`, `Completed`, `Cancelled`).

4. **Market Intelligence & Selling Decisions**
   - Data-driven APMC mandi spot pricing, multi-day historical trend graphs (7, 15, 30 days), and price change analytics.
   - Transparent estimate ranges and explainable recommendations (**SELL**, **MONITOR**, **WAIT**) with mandi freight arbitrage calculations.

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

# AGRO-SMART
**Smart Farming. Smarter Decisions. Better Harvests.**

> An AI-powered digital platform for smarter agriculture built for modern farmers, agribusinesses, and agronomists.

---

## 🌾 Core Features (4 Pillars)

1. **AI Crop Disease Detection**
   - Upload crop leaf photos to instantly diagnose bacterial, fungal, or viral diseases.
   - Receive confidence scores, severity ratings, and dual-action treatment plans (chemical vs organic).

2. **Crop-Specific Weather Risk Alerts**
   - Hyperlocal agro-meteorological intelligence based on real-time temperature, humidity, wind, and rain.
   - Custom vulnerability index for selected crops, spray window recommendations, and frost/heat warnings.

3. **Farm Machinery Rental**
   - Location-aware on-demand marketplace for tractors, harvesters, laser land levelers, and drone sprayers.
   - Filter by radius, equipment category, horsepower, and request real-time bookings with acreage estimators.

4. **Market Intelligence (Mandi / APMC)**
   - Live commodity spot prices, 7-day trend forecasts (Bullish / Bearish / Stable), and mandi price arbitrage.
   - Net profit and logistics margin calculator to help farmers decide *when* and *where* to sell.

---

## 🏗️ Tech Stack

- **Frontend**: React (Vite), JavaScript, HTML5, CSS3, Lucide React
- **Backend**: Python 3.10+, Flask, Flask-CORS, Requests
- **Database**: Supabase (PostgreSQL)
- **AI & APIs**: Crop Disease Diagnosis Service, Open-Meteo Agro-Weather API, APMC Mandi Market Feeds

---

## 📁 Repository Structure

```
/
├── frontend/             # React + Vite client
│   ├── src/
│   │   ├── components/   # Navbar, Footer, FeatureCard, StatBadge, Modal
│   │   ├── pages/        # Home, Disease Detection, Weather, Machinery, Market
│   │   ├── services/     # API integration services
│   │   ├── hooks/        # Geolocation & farm utilities
│   │   ├── utils/        # Formatters and calculators
│   │   └── assets/       # Icons and media
│   ├── package.json
│   └── vite.config.js
├── backend/              # Python Flask API server
│   ├── app.py            # Main application entry point
│   ├── routes/           # Disease, Weather, Machinery, Market routes
│   ├── services/         # Business logic & external API connectors
│   ├── models/           # Data definitions & Supabase bindings
│   ├── utils/            # Helper functions
│   └── requirements.txt
├── database/
│   └── schema.sql        # Supabase PostgreSQL schema and seed data
├── .env.example          # Environment variable template
├── .gitignore            # Git exclusion rules
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (Flask)
```bash
# Navigate to backend
cd backend

# Create & activate virtual environment (Optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server (runs on http://localhost:5000)
python app.py
```

### 2. Frontend Setup (React)
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

### 3. Database Setup (Supabase)
1. Create a new project in [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** tab.
3. Paste the contents of `database/schema.sql` and click **Run**.
4. Update `backend/.env` with your Supabase credentials.

---

## 🔒 Security & Environment
- Never commit `.env` or sensitive API keys.
- Reference `.env.example` to configure custom API tokens.

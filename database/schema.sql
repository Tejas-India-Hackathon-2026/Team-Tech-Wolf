-- ==========================================================
-- AGRO-SMART Database Schema (Supabase / PostgreSQL)
-- Smart Farming. Smarter Decisions. Better Harvests.
-- ==========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CROPS MASTER TABLE
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- Cereal, Pulse, Vegetable, Fruit, Cash Crop
    optimal_temp_min NUMERIC(4,1),
    optimal_temp_max NUMERIC(4,1),
    optimal_humidity_min NUMERIC(4,1),
    optimal_humidity_max NUMERIC(4,1),
    water_requirement VARCHAR(50), -- Low, Moderate, High
    growing_season VARCHAR(50),    -- Kharif, Rabi, Zaid, Perennial
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DISEASE SCANS TABLE (AI Crop Disease Detection History)
CREATE TABLE IF NOT EXISTS disease_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Nullable for anonymous/farmer scans
    crop_name VARCHAR(100) NOT NULL,
    image_url TEXT,
    detected_disease VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(150),
    confidence NUMERIC(5,2) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('None', 'Low', 'Moderate', 'Severe', 'Critical')),
    symptoms JSONB DEFAULT '[]'::jsonb,
    advice JSONB DEFAULT '[]'::jsonb,
    prevention JSONB DEFAULT '[]'::jsonb,
    regional_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WEATHER CHECKS TABLE (Crop-Specific Risk Assessment Log)
CREATE TABLE IF NOT EXISTS weather_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Nullable for anonymous/farmer scans
    crop_name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    temperature NUMERIC(4,1),
    humidity NUMERIC(4,1),
    rain_chance NUMERIC(4,1),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'Low', 'Moderate', 'High')),
    concern TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CROP DISEASE DIAGNOSIS MASTER KNOWLEDGE TABLE
CREATE TABLE IF NOT EXISTS crop_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(100) NOT NULL,
    disease_name VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(150),
    confidence_score NUMERIC(5,2) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('None', 'Low', 'Moderate', 'Severe', 'Critical')),
    symptoms TEXT,
    chemical_treatment TEXT,
    organic_treatment TEXT,
    preventive_measures TEXT,
    regional_explanation TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FARM MACHINERY LISTINGS
CREATE TABLE IF NOT EXISTS machinery_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Tractor, Harvester, Drone, Tillage, Sowing, Sprayer
    model_year INT,
    horse_power INT,
    price_per_hour NUMERIC(10,2) NOT NULL,
    price_per_day NUMERIC(10,2),
    location_city VARCHAR(100) NOT NULL,
    location_state VARCHAR(100) NOT NULL,
    distance_km NUMERIC(5,1) DEFAULT 0.0,
    owner_name VARCHAR(150) NOT NULL,
    owner_phone VARCHAR(20) NOT NULL,
    rating NUMERIC(2,1) DEFAULT 4.8,
    is_available BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MACHINERY BOOKINGS
CREATE TABLE IF NOT EXISTS machinery_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machinery_id UUID REFERENCES machinery_listings(id) ON DELETE CASCADE,
    farmer_name VARCHAR(150) NOT NULL,
    farmer_phone VARCHAR(20) NOT NULL,
    booking_date DATE NOT NULL,
    duration_hours INT NOT NULL,
    acres_to_cover NUMERIC(6,2),
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Confirmed' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MANDI / APMC MARKET COMMODITY PRICES
CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    mandi_name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    min_price NUMERIC(10,2) NOT NULL,
    max_price NUMERIC(10,2) NOT NULL,
    modal_price NUMERIC(10,2) NOT NULL,
    price_unit VARCHAR(20) DEFAULT '₹/Quintal',
    price_trend VARCHAR(20) CHECK (price_trend IN ('Bullish', 'Bearish', 'Stable')),
    forecast_next_week NUMERIC(10,2),
    reported_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================
-- SEED DATA
-- ==========================================================

-- Seed Crops
INSERT INTO crops (name, category, optimal_temp_min, optimal_temp_max, optimal_humidity_min, optimal_humidity_max, water_requirement, growing_season)
VALUES
('Tomato', 'Vegetable', 18.0, 28.0, 50.0, 75.0, 'Moderate', 'All Season'),
('Potato', 'Vegetable', 15.0, 22.0, 60.0, 85.0, 'Moderate', 'Rabi'),
('Rice', 'Cereal', 20.0, 35.0, 60.0, 90.0, 'High', 'Kharif'),
('Wheat', 'Cereal', 15.0, 25.0, 40.0, 70.0, 'Moderate', 'Rabi'),
('Cotton', 'Cash Crop', 21.0, 32.0, 50.0, 80.0, 'Moderate', 'Kharif'),
('Corn', 'Cereal', 18.0, 30.0, 50.0, 80.0, 'Moderate', 'Kharif')
ON CONFLICT (name) DO NOTHING;

-- Seed Sample Weather Check
INSERT INTO weather_checks (crop_name, location, temperature, humidity, rain_chance, risk_level, concern, recommendation)
VALUES
('Tomato', 'Patna, Bihar', 32.0, 68.0, 70.0, 'MODERATE',
'High humidity + rainfall may increase fungal disease risk.',
'Monitor leaves closely and avoid irrigation before rainfall.')
ON CONFLICT DO NOTHING;

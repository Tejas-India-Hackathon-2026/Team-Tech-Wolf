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
    category VARCHAR(50) NOT NULL,
    optimal_temp_min NUMERIC(4,1),
    optimal_temp_max NUMERIC(4,1),
    optimal_humidity_min NUMERIC(4,1),
    optimal_humidity_max NUMERIC(4,1),
    water_requirement VARCHAR(50),
    growing_season VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DISEASE SCANS TABLE (AI Crop Disease Detection History)
CREATE TABLE IF NOT EXISTS disease_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
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
    user_id UUID,
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

-- 4. FARM MACHINERY MASTER TABLE
CREATE TABLE IF NOT EXISTS machinery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_name VARCHAR(150) NOT NULL,
    owner_phone VARCHAR(20) NOT NULL,
    machine_name VARCHAR(150) NOT NULL,
    machine_type VARCHAR(50) NOT NULL CHECK (machine_type IN ('Tractor', 'Harvester', 'Rotavator', 'Cultivator', 'Seed Drill', 'Drone Sprayer')),
    horse_power INT DEFAULT 45,
    price_per_hour NUMERIC(10,2) NOT NULL,
    price_per_day NUMERIC(10,2),
    rating NUMERIC(2,1) DEFAULT 4.8,
    reviews_count INT DEFAULT 18,
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    location VARCHAR(150) NOT NULL,
    distance_km NUMERIC(5,1) DEFAULT 2.5,
    availability VARCHAR(30) DEFAULT 'Available Now',
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FARM MACHINERY BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS machinery_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machinery_id UUID REFERENCES machinery(id) ON DELETE CASCADE,
    farmer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    service_location VARCHAR(200) NOT NULL,
    booking_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    estimated_hours NUMERIC(4,1) NOT NULL,
    estimated_cost NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Accepted' CHECK (status IN ('Pending', 'Accepted', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MANDI / APMC MARKET PRICES TABLE (Part 5: Market Intelligence)
CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(100) NOT NULL,
    mandi_name VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    price_per_quintal NUMERIC(10,2) NOT NULL,
    price_date DATE NOT NULL,
    source VARCHAR(100) DEFAULT 'Demo Market Data',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for fast querying on crop, location, and date
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON market_prices(crop_name);
CREATE INDEX IF NOT EXISTS idx_market_prices_location ON market_prices(location);
CREATE INDEX IF NOT EXISTS idx_market_prices_date ON market_prices(price_date);

-- ==========================================================
-- SEED DATA
-- ==========================================================

-- Seed Crops
INSERT INTO crops (name, category, optimal_temp_min, optimal_temp_max, optimal_humidity_min, optimal_humidity_max, water_requirement, growing_season)
VALUES
('Tomato', 'Vegetable', 18.0, 28.0, 50.0, 75.0, 'Moderate', 'All Season'),
('Potato', 'Vegetable', 15.0, 22.0, 60.0, 85.0, 'Moderate', 'Rabi'),
('Onion', 'Vegetable', 15.0, 30.0, 50.0, 70.0, 'Moderate', 'Rabi/Kharif'),
('Wheat', 'Cereal', 15.0, 25.0, 40.0, 70.0, 'Moderate', 'Rabi'),
('Rice', 'Cereal', 20.0, 35.0, 60.0, 90.0, 'High', 'Kharif'),
('Maize', 'Cereal', 18.0, 30.0, 50.0, 80.0, 'Moderate', 'Kharif')
ON CONFLICT (name) DO NOTHING;

-- Seed Market Prices (Sample initial records)
INSERT INTO market_prices (crop_name, mandi_name, location, price_per_quintal, price_date, source)
VALUES
('Tomato', 'Patna Mandi', 'Patna, Bihar', 2200.00, CURRENT_DATE, 'Demo Market Data'),
('Wheat', 'Pune Mandi (Gultekdi)', 'Pune, Maharashtra', 2720.00, CURRENT_DATE, 'Demo Market Data'),
('Onion', 'Lasalgaon Mandi', 'Nashik, Maharashtra', 2180.00, CURRENT_DATE, 'Demo Market Data'),
('Rice', 'Karnal APMC', 'Karnal, Haryana', 4310.00, CURRENT_DATE, 'Demo Market Data'),
('Potato', 'Agra APMC', 'Agra, Uttar Pradesh', 1420.00, CURRENT_DATE, 'Demo Market Data'),
('Maize', 'Latur APMC', 'Latur, Maharashtra', 2150.00, CURRENT_DATE, 'Demo Market Data')
ON CONFLICT DO NOTHING;

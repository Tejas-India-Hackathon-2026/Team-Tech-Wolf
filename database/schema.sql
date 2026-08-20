-- ==========================================================
-- AGRO-SMART Consolidated Database Schema (Supabase / PostgreSQL)
-- Smart Farming. Smarter Decisions. Better Harvests.
-- ==========================================================

-- Enable UUID extension
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

-- 2. DISEASE SCANS TABLE (AI Crop Disease Detection Logs)
CREATE TABLE IF NOT EXISTS disease_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Nullable for anonymous/farmer scans
    crop_name VARCHAR(100) NOT NULL,
    image_url TEXT,
    detected_disease VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(150),
    confidence NUMERIC(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
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
    temperature NUMERIC(4,1) NOT NULL,
    humidity NUMERIC(4,1) NOT NULL CHECK (humidity >= 0 AND humidity <= 100),
    rain_chance NUMERIC(4,1) NOT NULL CHECK (rain_chance >= 0 AND rain_chance <= 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'Low', 'Moderate', 'High')),
    concern TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FARM MACHINERY MASTER TABLE (Uber for Tractors Marketplace)
CREATE TABLE IF NOT EXISTS machinery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_name VARCHAR(150) NOT NULL,
    owner_phone VARCHAR(20) NOT NULL,
    machine_name VARCHAR(150) NOT NULL,
    machine_type VARCHAR(50) NOT NULL CHECK (machine_type IN ('Tractor', 'Harvester', 'Rotavator', 'Cultivator', 'Seed Drill', 'Drone Sprayer')),
    horse_power INT DEFAULT 45,
    price_per_hour NUMERIC(10,2) NOT NULL CHECK (price_per_hour > 0),
    price_per_day NUMERIC(10,2) CHECK (price_per_day > 0),
    rating NUMERIC(2,1) DEFAULT 4.8 CHECK (rating >= 1.0 AND rating <= 5.0),
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
    estimated_hours NUMERIC(4,1) NOT NULL CHECK (estimated_hours > 0),
    estimated_cost NUMERIC(10,2) NOT NULL CHECK (estimated_cost >= 0),
    status VARCHAR(30) DEFAULT 'Accepted' CHECK (status IN ('Pending', 'Accepted', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MANDI / APMC MARKET PRICES TABLE
CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(100) NOT NULL,
    mandi_name VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    price_per_quintal NUMERIC(10,2) NOT NULL CHECK (price_per_quintal > 0),
    price_date DATE NOT NULL,
    source VARCHAR(100) DEFAULT 'Demo Market Data',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Useful Indexing for fast queries
CREATE INDEX IF NOT EXISTS idx_disease_scans_crop ON disease_scans(crop_name);
CREATE INDEX IF NOT EXISTS idx_weather_checks_crop ON weather_checks(crop_name);
CREATE INDEX IF NOT EXISTS idx_weather_checks_location ON weather_checks(location);
CREATE INDEX IF NOT EXISTS idx_machinery_type ON machinery(machine_type);
CREATE INDEX IF NOT EXISTS idx_machinery_location ON machinery(location);
CREATE INDEX IF NOT EXISTS idx_machinery_bookings_machinery ON machinery_bookings(machinery_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON market_prices(crop_name);
CREATE INDEX IF NOT EXISTS idx_market_prices_location ON market_prices(location);
CREATE INDEX IF NOT EXISTS idx_market_prices_date ON market_prices(price_date);

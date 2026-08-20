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

-- 4. FARM MACHINERY MASTER TABLE (Uber for Tractors Marketplace)
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

-- 6. MANDI / APMC MARKET COMMODITY PRICES
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

-- Seed Farm Machinery Listings
INSERT INTO machinery (owner_name, owner_phone, machine_name, machine_type, horse_power, price_per_hour, price_per_day, rating, reviews_count, location, distance_km, availability, features)
VALUES
('Rajesh Patil', '+91 98234 11201', 'Mahindra 575 DI Power Plus', 'Tractor', 47, 700.00, 4900.00, 4.8, 34, 'Pune Rural, Maharashtra', 2.5, 'Available Now', '["Power Steering", "Rotavator Ready", "Dual Clutch", "Low Fuel Burn"]'::jsonb),
('Suresh Kulkarni', '+91 97654 88312', 'John Deere 5310 4WD Heavy Duty', 'Tractor', 55, 850.00, 5800.00, 4.9, 48, 'Baramati, Maharashtra', 6.2, 'Available Now', '["4-Wheel Drive", "Heavy Cultivation", "AC Cabin", "Laser Leveler Ready"]'::jsonb),
('Manoj Kumar Singh', '+91 94310 22345', 'Swaraj 855 FE Heavy Duty Tractor', 'Tractor', 52, 650.00, 4500.00, 4.7, 28, 'Patna Rural, Bihar', 3.8, 'Available Now', '["Multi-Speed PTO", "High Torque", "Plough Compatible"]'::jsonb),
('Gurmeet Singh', '+91 94220 54321', 'Preet 987 Self-Propelled Multi-Crop', 'Harvester', 101, 1600.00, 11000.00, 4.9, 29, 'Karnal, Haryana', 8.5, 'Available Now', '["14ft Cutter Bar", "Paddy & Wheat Specialist", "Straw Chopper Included"]'::jsonb),
('Harpreet Gill', '+91 98140 77654', 'Claas Crop Tiger 30 Grain Harvester', 'Harvester', 75, 1800.00, 12500.00, 4.8, 19, 'Ludhiana, Punjab', 12.0, 'Available Now', '["Rubber Tracks for Wet Soil", "High Grain Recovery", "Low Grain Loss"]'::jsonb),
('Vikas Shinde', '+91 98601 99887', 'Shaktiman Semi-Champion 7-Feet', 'Rotavator', 50, 350.00, 2400.00, 4.8, 22, 'Ahmednagar, Maharashtra', 4.5, 'Available Now', '["48 Boron Steel Blades", "205cm Working Width", "Multi-Speed Gearbox"]'::jsonb),
('Rameshwar Yadav', '+91 94302 88123', 'Fieldking Heavy Duty 9-Tyne Rigid', 'Cultivator', 45, 300.00, 2000.00, 4.7, 16, 'Patna, Bihar', 5.0, 'Available Now', '["9 Forged Tynes", "Zero Soil Compaction", "High Penetration"]'::jsonb),
('Babanrao Patil', '+91 94231 66778', 'National Automatic Seed-Cum-Fertilizer Drill', 'Seed Drill', 45, 400.00, 2800.00, 4.9, 25, 'Agra, Uttar Pradesh', 9.2, 'Available Now', '["9-Row Sowing", "Simultaneous Fertilizer Metering", "Zero-Till Adaptable"]'::jsonb)
ON CONFLICT DO NOTHING;

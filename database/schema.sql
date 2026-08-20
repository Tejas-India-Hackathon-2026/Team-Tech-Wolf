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

-- 2. CROP DISEASE DIAGNOSIS RECORDS
CREATE TABLE IF NOT EXISTS crop_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(100) NOT NULL,
    disease_name VARCHAR(150) NOT NULL,
    scientific_name VARCHAR(150),
    confidence_score NUMERIC(5,2) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('Low', 'Moderate', 'Severe', 'Critical')),
    symptoms TEXT,
    chemical_treatment TEXT,
    organic_treatment TEXT,
    preventive_measures TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FARM MACHINERY LISTINGS
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

-- 4. MACHINERY BOOKINGS
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

-- 5. MANDI / APMC MARKET COMMODITY PRICES
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

-- 6. WEATHER RISK ALERTS & LOGS
CREATE TABLE IF NOT EXISTS weather_risk_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_name VARCHAR(150) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Severe')),
    risk_type VARCHAR(100) NOT NULL, -- Frost, Pest Outbreak, Heat Stress, Heavy Rain, Dry Spell
    temperature NUMERIC(4,1),
    humidity NUMERIC(4,1),
    spray_recommendation VARCHAR(50), -- Optimal, Caution, Avoid
    advisory TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================
-- SEED DATA FOR QUICK START & HACKATHON DEMO
-- ==========================================================

-- Seed Crops
INSERT INTO crops (name, category, optimal_temp_min, optimal_temp_max, optimal_humidity_min, optimal_humidity_max, water_requirement, growing_season)
VALUES
('Wheat', 'Cereal', 15.0, 25.0, 40.0, 70.0, 'Moderate', 'Rabi'),
('Rice (Paddy)', 'Cereal', 20.0, 35.0, 60.0, 90.0, 'High', 'Kharif'),
('Tomato', 'Vegetable', 18.0, 28.0, 50.0, 75.0, 'Moderate', 'All Season'),
('Potato', 'Vegetable', 15.0, 22.0, 60.0, 85.0, 'Moderate', 'Rabi'),
('Cotton', 'Cash Crop', 21.0, 32.0, 50.0, 80.0, 'Moderate', 'Kharif'),
('Sugarcane', 'Cash Crop', 24.0, 35.0, 65.0, 85.0, 'High', 'Perennial')
ON CONFLICT (name) DO NOTHING;

-- Seed Machinery Listings
INSERT INTO machinery_listings (name, category, model_year, horse_power, price_per_hour, price_per_day, location_city, location_state, distance_km, owner_name, owner_phone, rating, is_available, specs)
VALUES
('Mahindra 575 DI Power Plus Tractor', 'Tractor', 2023, 47, 450.00, 3200.00, 'Pune Rural', 'Maharashtra', 3.8, 'Rajesh Patil', '+91 98234 11201', 4.9, true, '{"transmission": "8 Forward + 2 Reverse", "fuel": "Diesel", "attachments": ["Rotavator", "Cultivator"]}'),
('John Deere 5310 4WD Heavy Duty Tractor', 'Tractor', 2024, 55, 600.00, 4200.00, 'Baramati', 'Maharashtra', 7.5, 'Suresh Kulkarni', '+91 97654 88312', 4.9, true, '{"transmission": "Collarshift", "fuel": "Diesel", "attachments": ["Laser Leveler", "MB Plough"]}'),
('Preet 987 Self Propelled Combine Harvester', 'Harvester', 2022, 101, 1400.00, 9800.00, 'Nashik', 'Maharashtra', 12.0, 'Gurmeet Singh', '+91 94220 54321', 4.8, true, '{"crop_suitability": ["Wheat", "Paddy", "Soybean"], "cutter_bar_width": "14 feet"}'),
('Garuda Agro-Hexacopter Spray Drone (16L)', 'Drone', 2024, 0, 750.00, 5000.00, 'Pune Suburbs', 'Maharashtra', 4.2, 'Amit Deshmukh (AgriTech Hub)', '+91 98900 12345', 5.0, true, '{"tank_capacity": "16 Litres", "coverage_speed": "1 acre in 7 mins", "pilot_included": true}'),
('Shaktiman Semi-Champion Rotavator (7 ft)', 'Tillage', 2023, 50, 300.00, 2000.00, 'Ahmednagar', 'Maharashtra', 8.4, 'Vikas More', '+91 98601 99887', 4.7, true, '{"blades": 48, "working_width": "205 cm"}'),
('Automatic Pneumatic Seed-Cum-Fertilizer Drill', 'Sowing', 2023, 45, 380.00, 2500.00, 'Kolhapur', 'Maharashtra', 15.1, 'Babanrao Shinde', '+91 94231 66778', 4.8, true, '{"rows": 9, "depth_control": "Adjustable hydraulic"}');

-- Seed Market Commodity Prices
INSERT INTO market_prices (commodity, variety, mandi_name, district, state, min_price, max_price, modal_price, price_trend, forecast_next_week)
VALUES
('Wheat', 'Lokwan', 'Pune Mandi (Gultekdi)', 'Pune', 'Maharashtra', 2450.00, 2850.00, 2680.00, 'Bullish', 2740.00),
('Wheat', 'Sharbati', 'Nashik APMC', 'Nashik', 'Maharashtra', 2800.00, 3400.00, 3150.00, 'Bullish', 3220.00),
('Soybean', 'Yellow', 'Latur APMC', 'Latur', 'Maharashtra', 4300.00, 4850.00, 4620.00, 'Stable', 4650.00),
('Tomato', 'Hybrid Red', 'Narayangaon Mandi', 'Pune', 'Maharashtra', 1800.00, 2600.00, 2200.00, 'Bearish', 1950.00),
('Onion', 'Nashik Red', 'Lasalgaon Mandi', 'Nashik', 'Maharashtra', 1600.00, 2400.00, 2050.00, 'Bullish', 2280.00),
('Cotton', 'Medium Staple', 'Akola Mandi', 'Akola', 'Maharashtra', 6800.00, 7550.00, 7200.00, 'Stable', 7250.00),
('Rice (Paddy)', 'Basmati 1121', 'Karnal APMC', 'Karnal', 'Haryana', 3800.00, 4450.00, 4200.00, 'Bullish', 4350.00),
('Potato', 'Jyoti', 'Agra Mandi', 'Agra', 'Uttar Pradesh', 1100.00, 1550.00, 1380.00, 'Stable', 1400.00);

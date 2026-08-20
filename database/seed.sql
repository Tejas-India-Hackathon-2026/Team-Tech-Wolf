-- ==========================================================
-- AGRO-SMART Seed Data (database/seed.sql)
-- Multi-crop, machinery marketplace, and mandi price seed records
-- ==========================================================

-- 1. CROPS SEED
INSERT INTO crops (name, category, optimal_temp_min, optimal_temp_max, optimal_humidity_min, optimal_humidity_max, water_requirement, growing_season)
VALUES
('Tomato', 'Vegetable', 18.0, 28.0, 50.0, 75.0, 'Moderate', 'All Season'),
('Potato', 'Vegetable', 15.0, 22.0, 60.0, 85.0, 'Moderate', 'Rabi'),
('Onion', 'Vegetable', 15.0, 30.0, 50.0, 70.0, 'Moderate', 'Rabi/Kharif'),
('Wheat', 'Cereal', 15.0, 25.0, 40.0, 70.0, 'Moderate', 'Rabi'),
('Rice', 'Cereal', 20.0, 35.0, 60.0, 90.0, 'High', 'Kharif'),
('Cotton', 'Cash Crop', 21.0, 32.0, 50.0, 80.0, 'Moderate', 'Kharif'),
('Maize', 'Cereal', 18.0, 30.0, 50.0, 80.0, 'Moderate', 'Kharif'),
('Sugarcane', 'Cash Crop', 20.0, 35.0, 60.0, 85.0, 'High', 'Perennial')
ON CONFLICT (name) DO NOTHING;

-- 2. FARM MACHINERY MARKETPLACE SEED
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

-- 3. INITIAL SAMPLE WEATHER CHECK
INSERT INTO weather_checks (crop_name, location, temperature, humidity, rain_chance, risk_level, concern, recommendation)
VALUES
('Tomato', 'Patna, Bihar', 32.0, 68.0, 70.0, 'MODERATE',
'High humidity + rainfall may increase fungal disease risk.',
'Monitor leaves closely and avoid irrigation before rainfall.')
ON CONFLICT DO NOTHING;

-- 4. HISTORICAL APMC MANDI PRICES SEED (Demo Market Data)
INSERT INTO market_prices (crop_name, mandi_name, location, price_per_quintal, price_date, source)
VALUES
('Tomato', 'Patna Mandi', 'Patna, Bihar', 2040.00, CURRENT_DATE - INTERVAL '30 days', 'Demo Market Data'),
('Tomato', 'Patna Mandi', 'Patna, Bihar', 2110.00, CURRENT_DATE - INTERVAL '15 days', 'Demo Market Data'),
('Tomato', 'Patna Mandi', 'Patna, Bihar', 2200.00, CURRENT_DATE, 'Demo Market Data'),
('Wheat', 'Pune Mandi (Gultekdi)', 'Pune, Maharashtra', 2640.00, CURRENT_DATE - INTERVAL '30 days', 'Demo Market Data'),
('Wheat', 'Pune Mandi (Gultekdi)', 'Pune, Maharashtra', 2720.00, CURRENT_DATE, 'Demo Market Data'),
('Onion', 'Lasalgaon Mandi', 'Nashik, Maharashtra', 1960.00, CURRENT_DATE - INTERVAL '30 days', 'Demo Market Data'),
('Onion', 'Lasalgaon Mandi', 'Nashik, Maharashtra', 2180.00, CURRENT_DATE, 'Demo Market Data'),
('Rice', 'Karnal APMC', 'Karnal, Haryana', 4150.00, CURRENT_DATE - INTERVAL '30 days', 'Demo Market Data'),
('Rice', 'Karnal APMC', 'Karnal, Haryana', 4310.00, CURRENT_DATE, 'Demo Market Data'),
('Potato', 'Agra APMC', 'Agra, Uttar Pradesh', 1400.00, CURRENT_DATE - INTERVAL '30 days', 'Demo Market Data'),
('Potato', 'Agra APMC', 'Agra, Uttar Pradesh', 1420.00, CURRENT_DATE, 'Demo Market Data'),
('Maize', 'Latur APMC', 'Latur, Maharashtra', 2250.00, CURRENT_DATE - INTERVAL '30 days', 'Demo Market Data'),
('Maize', 'Latur APMC', 'Latur, Maharashtra', 2150.00, CURRENT_DATE, 'Demo Market Data')
ON CONFLICT DO NOTHING;

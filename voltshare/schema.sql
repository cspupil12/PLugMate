-- ====================================================================
-- VoltShare Database Schema & Seed Data (Supabase / PostgreSQL Mumbai)
-- Run this in the Supabase SQL Editor to initialize the database in 1 click.
-- ====================================================================

-- 1. Drop existing tables if re-initializing (in reverse order of dependencies)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS chargers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'driver', -- 'driver' or 'host'
    trust_strikes INT DEFAULT 0,
    token_balance FLOAT DEFAULT 1000.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create chargers table
CREATE TABLE chargers (
    id SERIAL PRIMARY KEY,
    host_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    h3_index VARCHAR(30) NOT NULL, -- Uber H3 Resolution 8 neighborhood cell
    connector_type VARCHAR(50) DEFAULT 'Type-2', -- 'Type-2' or '15A-3Pin'
    power_kw FLOAT DEFAULT 7.4,
    hourly_rate FLOAT DEFAULT 18.0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chargers_h3_index ON chargers(h3_index);
CREATE INDEX idx_chargers_is_available ON chargers(is_available);

-- 4. Create vehicles table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    driver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    battery_capacity_kwh FLOAT DEFAULT 40.5
);

-- 5. Create bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    charger_id INT NOT NULL REFERENCES chargers(id) ON DELETE CASCADE,
    driver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hours FLOAT DEFAULT 2.0,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'ARRIVED', 'ACTIVE', 'COMPLETED', 'CANCELLED'
    charge_token_pin VARCHAR(4) NOT NULL,
    total_amount FLOAT NOT NULL,
    host_payout FLOAT NOT NULL,
    platform_fee FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_driver ON bookings(driver_id);
CREATE INDEX idx_bookings_charger ON bookings(charger_id);

-- ====================================================================
-- SEED DATA (Jalandhar & Ludhiana Chargers + Demo Profiles)
-- ====================================================================

-- 1. Insert Demo Users
INSERT INTO users (id, name, phone, role, trust_strikes, token_balance) VALUES
(1, 'Aman Sharma', '+919876500001', 'driver', 0, 1500.0),
(2, 'Harpreet Singh', '+919876500002', 'host', 0, 3400.0),
(3, 'Gurmeet Kaur', '+919876500003', 'host', 0, 2100.0);

ALTER SEQUENCE users_id_seq RESTART WITH 4;

-- 2. Insert Driver Vehicle
INSERT INTO vehicles (id, driver_id, model_name, battery_capacity_kwh) VALUES
(1, 1, 'Tata Nexon EV Max', 40.5);

ALTER SEQUENCE vehicles_id_seq RESTART WITH 2;

-- 3. Insert 8 Realistic Chargers in Jalandhar & Ludhiana
-- Note: h3_index contains standard Resolution 8 cells for these coordinates.
INSERT INTO chargers (id, host_id, title, address, lat, lng, h3_index, connector_type, power_kw, hourly_rate, is_available) VALUES
-- Jalandhar Zone 1: Model Town
(1, 2, 'Model Town Kothi Wallbox (7.4kW)', 'House 142-A, Model Town, Jalandhar', 31.3090, 75.5802, '8860a92705fffff', 'Type-2', 7.4, 20.0, TRUE),

-- Jalandhar Zone 2: Urban Estate Phase II
(2, 2, 'Urban Estate Phase II Fast Socket (3.3kW)', 'Plot 88, Urban Estate Phase II, Jalandhar', 31.2855, 75.6020, '8860a9274bfffff', '15A-3Pin', 3.3, 14.0, TRUE),

-- Jalandhar Zone 3: Cantt Officer Enclave
(3, 3, 'Jalandhar Cantt Officer Enclave (7.4kW)', 'Bungalow 12, Mall Road, Cantt, Jalandhar', 31.2780, 75.6145, '8860a92749fffff', 'Type-2', 7.4, 22.0, TRUE),

-- Jalandhar Zone 4: Rama Mandi Bypass
(4, 3, 'Rama Mandi Highway Driveway (3.3kW)', 'Near Hoshiarpur Road Bye-pass, Rama Mandi', 31.3340, 75.6310, '8860a92633fffff', '15A-3Pin', 3.3, 12.0, TRUE),

-- Jalandhar Zone 5: Civil Lines
(5, 2, 'Civil Lines Eco Socket (15A)', '45 Mahavir Marg, Civil Lines, Jalandhar', 31.3210, 75.5780, '8860a92701fffff', '15A-3Pin', 3.3, 15.0, TRUE),

-- Ludhiana Zone 1: Sarabha Nagar
(6, 3, 'Sarabha Nagar Green Driveway (7.4kW)', 'Main Market Road, Sarabha Nagar, Ludhiana', 30.8872, 75.8115, '8860ba2655fffff', 'Type-2', 7.4, 24.0, TRUE),

-- Ludhiana Zone 2: BRS Nagar
(7, 2, 'BRS Nagar Block C Charger (7.4kW)', 'Block C, Bhai Randhir Singh Nagar, Ludhiana', 30.8790, 75.7950, '8860ba2657fffff', 'Type-2', 7.4, 20.0, TRUE),

-- Ludhiana Zone 3: Ferozepur Road
(8, 3, 'Ferozepur Road Hub (3.3kW)', 'Opposite PAU Gate 2, Ferozepur Road, Ludhiana', 30.9015, 75.8201, '8860ba2651fffff', '15A-3Pin', 3.3, 13.0, TRUE);

ALTER SEQUENCE chargers_id_seq RESTART WITH 9;

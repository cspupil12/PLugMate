-- ====================================================================
-- PlugMate Supabase Database Schema & Seed Data
-- Run this script in your Supabase SQL Editor (1-Click Run)
-- ====================================================================

-- 1. Create tables (in reverse dependency order if dropping)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS chargers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
    
-- 2. Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Supports Clerk IDs (e.g. user_2p...) or custom IDs
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'chargee', -- 'chargee' or 'host'
    avatar TEXT,
    vehicle JSONB, -- { make, model, reg_no, connector, battery_kwh }
    address TEXT,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Chargers Table
CREATE TABLE chargers (
    id SERIAL PRIMARY KEY,
    host_id TEXT NOT NULL,
    host_name TEXT NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'community',
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    connector_type TEXT NOT NULL DEFAULT 'Type-2 AC', -- 'Type-2 AC', '15A-3Pin', 'CCS-2 DC'
    power_kw NUMERIC(4, 1) DEFAULT 7.4,
    hourly_rate NUMERIC(6, 2) NOT NULL DEFAULT 20.00,
    is_available BOOLEAN DEFAULT TRUE,
    available_hours TEXT DEFAULT '06:00 AM - 11:30 PM',
    photo TEXT,
    amenities TEXT[] DEFAULT ARRAY['Gated Driveway', 'CCTV Monitor'],
    rating NUMERIC(2, 1) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    compatibility TEXT,
    surge_guarantee BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chargers_coords ON chargers(lat, lng);
CREATE INDEX idx_chargers_available ON chargers(is_available);
CREATE INDEX idx_chargers_connector ON chargers(connector_type);

-- 4. Bookings Table
CREATE TABLE bookings (
    id TEXT PRIMARY KEY, -- e.g. 'PM-8921'
    charger_id INT NOT NULL REFERENCES chargers(id) ON DELETE CASCADE,
    charger_title TEXT NOT NULL,
    charger_address TEXT NOT NULL,
    host_id TEXT NOT NULL,
    host_name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    user_vehicle TEXT,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    duration_hours NUMERIC(4, 1) DEFAULT 2.0,
    hourly_rate NUMERIC(6, 2) NOT NULL,
    base_cost NUMERIC(8, 2) NOT NULL,
    platform_fee NUMERIC(8, 2) NOT NULL,
    total_amount NUMERIC(8, 2) NOT NULL,
    pin VARCHAR(4) NOT NULL,
    status TEXT DEFAULT 'upcoming', -- 'upcoming', 'active', 'completed', 'cancelled'
    payment_method TEXT DEFAULT 'PlugMate Escrow (UPI)',
    payment_status TEXT DEFAULT 'Held in Escrow',
    reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_host ON bookings(host_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- 5. Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    charger_id INT NOT NULL REFERENCES chargers(id) ON DELETE CASCADE,
    booking_id TEXT,
    user_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    date DATE DEFAULT CURRENT_DATE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_charger ON reviews(charger_id);

-- 6. Disable Row Level Security (RLS) for seamless developer demo or enable public policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & authenticated reads/writes for app access
CREATE POLICY "Allow public read on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on users" ON users FOR ALL USING (true);

CREATE POLICY "Allow public read on chargers" ON chargers FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on chargers" ON chargers FOR ALL USING (true);

CREATE POLICY "Allow public read on bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on bookings" ON bookings FOR ALL USING (true);

CREATE POLICY "Allow public read on reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert on reviews" ON reviews FOR ALL USING (true);


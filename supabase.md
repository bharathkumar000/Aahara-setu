# 🚀 Aahara Setu: Unified Supabase & Data Architecture

This document tracks the complete SQL schema and data architecture for **Aahara Setu**. It combines the core setup guides for database initialization, real-time sync, and security policies.

---

## 1. Core Extensions & Initialization
We use `postgis` for location-based matching (finding donors within 2km) and `uuid-ossp` for primary keys.

```sql
-- Enable PostGIS for geography logic
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 2. Global Database Schema (Updated)
Execute this block to create the primary tables. Includes `is_disaster` support for emergency relief.

```sql
/**
 * 👤 PROFILES TABLE
 * Links directly to Supabase Auth users.
 */
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('donor', 'receiver', 'admin')) NOT NULL,
  organization_name TEXT, 
  fssai_id TEXT, -- Mandatory for Donor Verification
  phone_number TEXT,
  avatar_url TEXT,
  coords geography(POINT, 4326), 
  kindness_score INT DEFAULT 0,
  trust_score INT DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

/**
 * 🍱 DONATIONS TABLE (Core)
 */
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES public.profiles(id) NOT NULL,
  food_name TEXT NOT NULL,
  category TEXT NOT NULL,
  dietary_type TEXT DEFAULT 'Veg',
  is_disaster BOOLEAN DEFAULT FALSE, -- SOS / Relief Mode
  quantity_value NUMERIC NOT NULL,
  quantity_unit TEXT NOT NULL,
  expiry_time TIMESTAMPTZ NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_location geography(POINT, 4326) NOT NULL,
  urgency_score INT DEFAULT 0,
  is_audit_approved BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('available', 'claiming', 'claimed', 'expired', 'completed')) DEFAULT 'available',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

/**
 * 🤝 CLAIMS TABLE
 */
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES public.donations(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'dispatched', 'delivered', 'cancelled')) DEFAULT 'pending',
  verification_code TEXT DEFAULT upper(substring(uuid_generate_v4()::text, 1, 6)),
  proof_images TEXT[], -- Evidence for impact verification
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

/**
 * ⚠️ DISASTER ALERTS TABLE
 */
CREATE TABLE public.disaster_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_name TEXT NOT NULL,
  location_point geography(POINT, 4326) NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  needs TEXT[], -- e.g., ['Water', 'Cooked Meals']
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Advanced Views & Analytics
Run this to enable the Global Impact Leaderboard.

```sql
CREATE OR REPLACE VIEW public.impact_summary AS
SELECT 
  p.id,
  p.organization_name,
  p.role,
  p.kindness_score,
  COUNT(d.id) as total_contributions,
  SUM(CASE WHEN c.status = 'delivered' THEN 1 ELSE 0 END) as successful_impact_events
FROM public.profiles p
LEFT JOIN public.donations d ON p.id = d.donor_id
LEFT JOIN public.claims c ON p.id = c.receiver_id
GROUP BY p.id, p.organization_name, p.role, p.kindness_score;
```

---

## 4. PostGIS & Automation Functions
These power the "Urgency-Based Matching" and automatic score updates.

```sql
-- Search nearby food (PostGIS)
CREATE OR REPLACE FUNCTION get_nearby_food(user_lon FLOAT, user_lat FLOAT, radius INT DEFAULT 5000)
RETURNS TABLE (id UUID, food_name TEXT, distance_meters FLOAT, urgency_score INT) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.food_name, 
    ST_Distance(d.pickup_location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography) AS distance,
    d.urgency_score
  FROM public.donations d
  WHERE d.status = 'available'
    AND ST_DWithin(d.pickup_location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography, radius)
  ORDER BY d.urgency_score DESC, distance ASC;
END;
$$;

-- Automatic Impact Scoring (Trigger)
CREATE OR REPLACE FUNCTION update_impact_scores()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE public.profiles SET kindness_score = kindness_score + 100 WHERE id = (SELECT donor_id FROM public.donations WHERE id = NEW.donation_id);
    UPDATE public.profiles SET kindness_score = kindness_score + 25 WHERE id = NEW.receiver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_impact_event AFTER UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION update_impact_scores();
```

---

## 5. Security (RLS) & Real-Time Sync

```sql
-- Step 1: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Step 2: Policy (Example: Only verified receivers see food)
CREATE POLICY "Public filtered access" ON public.donations FOR SELECT USING (status = 'available');

-- Step 3: Enable Real-Time (Crucial for Dashboard matching)
CREATE PUBLICATION aahara_setu_realtime FOR TABLE public.donations, public.claims;
```

---

## 6. Auth Integration (Role-Based Sync)
Ensures every Supabase Auth user gets a profile with the correct role.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'role');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

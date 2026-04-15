-- RUN THIS IN YOUR SUPABASE SQL EDITOR --

-- 1. Create the food_listings table
CREATE TABLE IF NOT EXISTS food_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  donor TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expires_in TEXT NOT NULL,
  distance TEXT DEFAULT '0.4 km',
  demand TEXT DEFAULT 'High',
  urgency_score INTEGER DEFAULT 85,
  urgency_level TEXT DEFAULT 'high',
  dietary TEXT DEFAULT 'None',
  address TEXT NOT NULL
);

-- 2. Enable Real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE food_listings;

-- 3. Set up Row Level Security (OPTIONAL for demo)
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON food_listings FOR ALL USING (true);

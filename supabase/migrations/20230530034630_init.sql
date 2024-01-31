-- Migration script for Supabase schema including 'jobs' table

-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  billing_address JSONB,
  payment_method JSONB
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Can view own user data." ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Can update own user data." ON users FOR UPDATE USING (auth.uid() = id);

-- Handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Customers table
CREATE TABLE customers (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  stripe_customer_id TEXT
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  active BOOLEAN,
  name TEXT,
  description TEXT,
  image TEXT,
  metadata JSONB
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON products FOR SELECT USING (TRUE);

-- Prices table and related types
CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');
CREATE TABLE prices (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products,
  active BOOLEAN,
  description TEXT,
  unit_amount BIGINT,
  currency TEXT CHECK (char_length(currency) = 3),
  type pricing_type,
  interval pricing_plan_interval,
  interval_count INTEGER,
  trial_period_days INTEGER,
  metadata JSONB
);
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access" ON prices FOR SELECT USING (TRUE);

-- Subscriptions table and related types
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  status subscription_status,
  metadata JSONB,
  price_id TEXT REFERENCES prices,
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  created TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  current_period_start TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  current_period_end TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  ended_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  cancel_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  canceled_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  trial_start TIMESTAMPTZ DEFAULT timezone('utc', now()),
  trial_end TIMESTAMPTZ DEFAULT timezone('utc', now())
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Can only view own subs data" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Jobs table and related types
CREATE TYPE job_status AS ENUM ('pending', 'uploading', 'transcribing', 'translating', 'cloning', 'synthesizing', 'synchronizing', 'completed', 'failed');
CREATE TABLE jobs (
  id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  status job_status,
  video_url TEXT,
  original_video_url TEXT,
  original_audio_url TEXT,
  translated_audio_url TEXT,
  source_language TEXT,
  target_language TEXT,
  transcript JSON,
  transcription_id TEXT,
  translated_text TEXT,
  voice_id TEXT,
  credits INT,
  is_deleted BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users NOT NULL
);
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for authenticated users" ON jobs FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Enable update own data for authenticated users" ON jobs FOR UPDATE TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read own data for authenticated users" ON jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Realtime subscriptions
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE products, prices, jobs;

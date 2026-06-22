-- scripts/supabase_schema.sql
-- Production-Ready Supabase Schema for Discovering Bali (Idempotent Version)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rating NUMERIC(2,1) DEFAULT 5.0,
    reviews INTEGER DEFAULT 0,
    location TEXT,
    fleet_size INTEGER DEFAULT 1,
    phone TEXT,
    joined_year TEXT,
    verified BOOLEAN DEFAULT false,
    google_link TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('Tour', 'Spa', 'Scooter', 'Transport')),
    title TEXT NOT NULL,
    location TEXT,
    price INTEGER NOT NULL,
    duration TEXT,
    category TEXT,
    rating NUMERIC(2,1) DEFAULT 5.0,
    reviews INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Draft')),
    image TEXT,
    company_name TEXT, 
    data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BLOGS / PLACES TABLE
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    location TEXT,
    category TEXT,
    slug TEXT UNIQUE NOT NULL,
    meta_description TEXT,
    views TEXT,
    status TEXT DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
    image TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security: Row Level Security (RLS) is disabled for rapid CMS entry via custom dashboard
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs DISABLE ROW LEVEL SECURITY;

-- Access Policies (Skipped since RLS is currently disabled)
-- You can re-enable RLS later when you add JWT login functionality to your Admin Dashboard!

-- Structured Schema Enhancements (No AI Data)

-- Automatic update trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers safely
DROP TRIGGER IF EXISTS update_companies_modtime ON public.companies;
CREATE TRIGGER update_companies_modtime BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_listings_modtime ON public.listings;
CREATE TRIGGER update_listings_modtime BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_blogs_modtime ON public.blogs;
CREATE TRIGGER update_blogs_modtime BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_type ON public.listings(type);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);

-- ==========================================
-- STORAGE BUCKET: LISTING IMAGES
-- ==========================================

-- Create the public bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('discovering_bali_images', 'discovering_bali_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies
DROP POLICY IF EXISTS "Public Image Read" ON storage.objects;
CREATE POLICY "Public Image Read" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'discovering_bali_images');

DROP POLICY IF EXISTS "Authenticated Image Upload" ON storage.objects;
CREATE POLICY "Authenticated Image Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'discovering_bali_images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Image Upload (Dev Mode)" ON storage.objects;
CREATE POLICY "Public Image Upload (Dev Mode)" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'discovering_bali_images');

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    customer_name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    service_name TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    amount TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    category TEXT CHECK (category IN ('Tour', 'Activities', 'Transport', 'Spa', 'Scooter')),
    details JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_bookings_modtime ON public.bookings;
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- 5. HOMEPAGE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.homepage_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    campaign_video TEXT,
    campaign_youtube_link TEXT,
    campaign_recommendation TEXT,
    campaign_ig_link TEXT,
    campaign_recommendation_2 TEXT,
    campaign_ig_link_2 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.homepage_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
ALTER TABLE public.homepage_settings DISABLE ROW LEVEL SECURITY;

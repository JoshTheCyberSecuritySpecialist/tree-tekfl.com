/*
  # TREE TEK Website Database Schema

  ## Overview
  Creates the complete database schema for the TREE TEK website including:
  - Service quote request management
  - Gallery image management
  - Social media posts management

  ## New Tables

  ### service_requests
  Stores all customer service quote requests submitted through the website.
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Customer name
  - `phone` (text) - Customer phone number
  - `email` (text) - Customer email address
  - `address` (text) - Service location address
  - `city` (text) - Service location city
  - `zip` (text) - Service location ZIP code
  - `service_type` (text) - Type of service requested
  - `urgency` (text) - Normal or Emergency
  - `preferred_date` (date, nullable) - Customer's preferred service date
  - `description` (text) - Detailed description of service needed
  - `photos` (jsonb) - Array of uploaded photo URLs
  - `created_at` (timestamptz) - Request submission timestamp

  ### gallery_images
  Stores gallery photos displayed on the Past Work page.
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Photo title
  - `category` (text) - Service category
  - `url` (text) - Public URL to the image
  - `alt` (text) - SEO-optimized alt text
  - `created_at` (timestamptz) - Upload timestamp

  ### social_posts
  Stores social media posts displayed on the Social page.
  - `id` (uuid, primary key) - Unique identifier
  - `platform` (text) - instagram or facebook
  - `url` (text) - Link to the social media post
  - `caption` (text) - Post caption
  - `is_published` (boolean) - Visibility toggle
  - `created_at` (timestamptz) - Post creation timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies:

  #### service_requests
  - Anonymous users can INSERT new requests only
  - No public SELECT access (admin uses service role key)

  #### gallery_images
  - Anonymous users can SELECT published images
  - Admin writes via service role key

  #### social_posts
  - Anonymous users can SELECT published posts only
  - Admin writes via service role key
*/

-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  zip text NOT NULL,
  service_type text NOT NULL,
  urgency text NOT NULL DEFAULT 'Normal',
  preferred_date date,
  description text NOT NULL,
  photos jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on service_requests
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert requests
CREATE POLICY "Allow anonymous insert on service_requests"
  ON service_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  url text NOT NULL,
  alt text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on gallery_images
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to gallery images
CREATE POLICY "Allow public read on gallery_images"
  ON gallery_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create social_posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('instagram', 'facebook')),
  url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on social_posts
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published posts only
CREATE POLICY "Allow public read on published social_posts"
  ON social_posts
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_published ON social_posts(is_published) WHERE is_published = true;
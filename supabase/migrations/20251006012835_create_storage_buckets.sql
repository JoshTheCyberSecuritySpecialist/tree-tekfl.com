/*
  # Create Storage Buckets for TREE TEK

  ## Overview
  Creates storage buckets for gallery images and service request photos.

  ## Storage Buckets

  ### gallery
  - Public bucket for storing gallery images displayed on the Past Work page
  - Public read access for all users
  - Admin can upload via dashboard

  ### requests
  - Private bucket for storing service request photos
  - Photos are accessible via signed URLs in admin dashboard and emails
  - No public access

  ## Security
  - Gallery bucket has public read access
  - Requests bucket requires authentication for access
  - Both buckets use RLS policies for write operations
*/

-- Create gallery bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Create requests bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('requests', 'requests', false)
ON CONFLICT (id) DO NOTHING;

-- Gallery bucket policies
CREATE POLICY "Public read access for gallery"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can upload to gallery"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can delete from gallery"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery');

-- Requests bucket policies
CREATE POLICY "Authenticated users can read requests"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'requests');

CREATE POLICY "Service role can manage requests"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'requests');

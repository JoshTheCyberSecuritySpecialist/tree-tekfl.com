/*
  Past Work admin upgrade:
  - Adds gallery project management fields
  - Enables authenticated CRUD with RLS
  - Keeps public read to published projects only
*/

ALTER TABLE public.gallery_images
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS before_url text,
  ADD COLUMN IF NOT EXISTS after_url text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_google_review_overlay boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

ALTER TABLE public.gallery_images
  DROP CONSTRAINT IF EXISTS gallery_images_media_type_check;

ALTER TABLE public.gallery_images
  ADD CONSTRAINT gallery_images_media_type_check CHECK (media_type IN ('image', 'video'));

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on gallery_images" ON public.gallery_images;
CREATE POLICY "Allow public read published gallery_images"
  ON public.gallery_images
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated insert gallery_images" ON public.gallery_images;
CREATE POLICY "Allow authenticated insert gallery_images"
  ON public.gallery_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update gallery_images" ON public.gallery_images;
CREATE POLICY "Allow authenticated update gallery_images"
  ON public.gallery_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete gallery_images" ON public.gallery_images;
CREATE POLICY "Allow authenticated delete gallery_images"
  ON public.gallery_images
  FOR DELETE
  TO authenticated
  USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.gallery_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.gallery_images TO authenticated;

CREATE INDEX IF NOT EXISTS idx_gallery_images_display_order
  ON public.gallery_images (display_order ASC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_images_featured_published
  ON public.gallery_images (is_featured, is_published);

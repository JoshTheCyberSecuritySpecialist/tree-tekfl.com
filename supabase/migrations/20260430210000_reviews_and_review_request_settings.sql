/*
  Public testimonials + admin Reviews module.
  - reviews: customer quotes, moderation, featured flag
  - review_request_settings: singleton row for default Google review URL (admin copy tool)
*/

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  review_text text NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  city text,
  service_type text,
  status text NOT NULL DEFAULT 'approved',
  google_review_url text,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_check;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_status_check;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_status_check CHECK (status IN ('approved', 'pending', 'hidden'));

CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON public.reviews (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON public.reviews (featured DESC) WHERE status = 'approved';

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;
CREATE POLICY "Public can read approved reviews"
  ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

DROP POLICY IF EXISTS "Authenticated can manage reviews" ON public.reviews;
CREATE POLICY "Authenticated can manage reviews"
  ON public.reviews
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON TABLE public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.reviews TO authenticated;

-- Singleton settings for “copy review request” link (admin-only reads/writes)
CREATE TABLE IF NOT EXISTS public.review_request_settings (
  id smallint PRIMARY KEY DEFAULT 1,
  google_review_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_request_settings_singleton CHECK (id = 1)
);

INSERT INTO public.review_request_settings (id, google_review_url)
VALUES (1, '')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.review_request_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated manage review_request_settings" ON public.review_request_settings;
CREATE POLICY "Authenticated manage review_request_settings"
  ON public.review_request_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.review_request_settings TO authenticated;

NOTIFY pgrst, 'reload schema';

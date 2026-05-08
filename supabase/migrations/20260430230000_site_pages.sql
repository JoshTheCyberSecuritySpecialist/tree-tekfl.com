/*
  CMS overrides for SEO landing pages + optional new published routes.
*/

CREATE TABLE IF NOT EXISTS public.site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_title text,
  meta_description text,
  h1 text,
  excerpt text,
  content text,
  page_type text NOT NULL DEFAULT 'seo',
  location text,
  service_type text,
  status text NOT NULL DEFAULT 'published',
  featured_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_pages
  DROP CONSTRAINT IF EXISTS site_pages_status_check;
ALTER TABLE public.site_pages
  ADD CONSTRAINT site_pages_status_check CHECK (status IN ('published', 'draft'));

CREATE INDEX IF NOT EXISTS idx_site_pages_slug_status ON public.site_pages (slug, status);

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published site pages" ON public.site_pages;
CREATE POLICY "Public can read published site pages"
  ON public.site_pages
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated can manage site pages" ON public.site_pages;
CREATE POLICY "Authenticated can manage site pages"
  ON public.site_pages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON TABLE public.site_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.site_pages TO authenticated;

NOTIFY pgrst, 'reload schema';

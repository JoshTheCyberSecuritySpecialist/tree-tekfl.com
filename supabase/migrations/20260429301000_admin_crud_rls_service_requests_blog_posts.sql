/*
  Authenticated admins (JWT) can delete quote rows and update/delete blog posts.
  Run after admins use Supabase Auth + public.admins pattern.
*/

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at timestamptz;

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public blog + admin list still need SELECT when RLS is on
DROP POLICY IF EXISTS "Allow public read blog posts" ON public.blog_posts;
CREATE POLICY "Allow public read blog posts"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert blog posts" ON public.blog_posts;
CREATE POLICY "Allow authenticated insert blog posts"
  ON public.blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

GRANT SELECT ON TABLE public.blog_posts TO anon, authenticated;
GRANT INSERT ON TABLE public.blog_posts TO authenticated;

DROP POLICY IF EXISTS "Allow authenticated delete service requests" ON public.service_requests;
CREATE POLICY "Allow authenticated delete service requests"
  ON public.service_requests
  FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete blog posts" ON public.blog_posts;
CREATE POLICY "Allow authenticated delete blog posts"
  ON public.blog_posts
  FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated update blog posts" ON public.blog_posts;
CREATE POLICY "Allow authenticated update blog posts"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT DELETE ON TABLE public.service_requests TO authenticated;
GRANT UPDATE, DELETE ON TABLE public.blog_posts TO authenticated;

NOTIFY pgrst, 'reload schema';

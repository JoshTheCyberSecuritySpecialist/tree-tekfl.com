-- Run in Supabase SQL Editor if admin gets: permission denied for table blog_posts
-- (GRANT is required in addition to RLS policies.)

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON TABLE public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.blog_posts TO authenticated;

-- Optional: reload PostgREST schema cache (Supabase may pick up without this)
-- NOTIFY pgrst, 'reload schema';

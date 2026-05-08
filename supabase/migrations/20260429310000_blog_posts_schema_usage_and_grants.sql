/*
  Fixes: permission denied for table blog_posts
  
  PostgREST runs queries as anon/authenticated. Without SCHEMA USAGE and TABLE grants,
  Postgres returns permission denied even when RLS policies exist.
*/

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON TABLE public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.blog_posts TO authenticated;

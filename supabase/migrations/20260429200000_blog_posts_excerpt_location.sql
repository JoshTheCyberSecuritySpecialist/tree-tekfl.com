/*
  blog_posts: optional excerpt + location for TREE TEK blog.
  Safe if table already exists with fewer columns.
*/

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL DEFAULT '',
  excerpt text,
  location text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_key ON public.blog_posts (slug);

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS excerpt text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS image_url text;

/*
  Storage bucket `blog-images` (run in SQL Editor if not created via Dashboard):

  insert into storage.buckets (id, name, public)
  values ('blog-images', 'blog-images', true)
  on conflict (id) do update set public = true;

  create policy "Authenticated users can upload blog images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'blog-images');

  create policy "Public can read blog images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'blog-images');
*/

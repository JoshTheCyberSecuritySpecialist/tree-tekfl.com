-- TREE TEK — public bucket for featured images + markdown images from Supabase Storage
-- Run in Supabase SQL Editor if the bucket is not created in Dashboard → Storage.
-- Bucket name used by the frontend: blog-images

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

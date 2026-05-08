/*
  Centralized public media bucket for Admin → Media Library.
  Does not replace past-work-media, blog-images, or requests buckets.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Public can view media"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated can upload media" ON storage.objects;
CREATE POLICY "Authenticated can upload media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated can delete media" ON storage.objects;
CREATE POLICY "Authenticated can delete media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated can update media" ON storage.objects;
CREATE POLICY "Authenticated can update media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');

NOTIFY pgrst, 'reload schema';

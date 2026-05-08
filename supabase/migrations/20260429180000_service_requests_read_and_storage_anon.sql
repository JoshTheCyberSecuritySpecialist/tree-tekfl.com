-- Admin dashboard reads service requests as authenticated users (anon key + user session)
CREATE POLICY "Allow authenticated read on service_requests"
  ON service_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: allow service role / future edge functions (already bypasses RLS with service key)

-- Quote form: anonymous photo uploads to the private "requests" bucket (web/ prefix from app)
CREATE POLICY "Allow anonymous insert to requests bucket for web quotes"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'requests' AND (name LIKE 'web/%'));

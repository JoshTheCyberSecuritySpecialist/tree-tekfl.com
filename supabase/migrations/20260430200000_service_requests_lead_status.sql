/*
  CRM-style pipeline for admin Leads view.
  Adds status + authenticated UPDATE RLS (quotes tab already had DELETE).
*/

ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS status text;

UPDATE public.service_requests
SET status = 'new'
WHERE status IS NULL OR trim(status) = '';

ALTER TABLE public.service_requests
  ALTER COLUMN status SET DEFAULT 'new';

ALTER TABLE public.service_requests
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.service_requests
  DROP CONSTRAINT IF EXISTS service_requests_status_check;

ALTER TABLE public.service_requests
  ADD CONSTRAINT service_requests_status_check
  CHECK (lower(trim(status)) IN ('new', 'contacted', 'scheduled', 'completed', 'lost'));

CREATE INDEX IF NOT EXISTS idx_service_requests_status
  ON public.service_requests (lower(trim(status)));

DROP POLICY IF EXISTS "Allow authenticated update service requests" ON public.service_requests;
CREATE POLICY "Allow authenticated update service requests"
  ON public.service_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT UPDATE ON TABLE public.service_requests TO authenticated;

NOTIFY pgrst, 'reload schema';

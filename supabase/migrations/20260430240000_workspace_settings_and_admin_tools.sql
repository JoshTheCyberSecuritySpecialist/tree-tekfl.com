/*
  Workspace settings + admin management helpers.
  - settings key/value store
  - admin-safe RPC helpers that read auth.users by email
  - admin table policies expanded for managed access
*/

CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.settings (key, value) VALUES
  ('business_info', '{"phone":"321-282-9795","email":"info@treetekfl.com","city":"Daytona Beach","service_area":"Volusia County, FL"}'::jsonb),
  ('notifications', '{"email_enabled": true, "lead_alerts": true}'::jsonb),
  ('site_defaults', '{"cta_text":"Request a Free Quote"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read selected settings" ON public.settings;
CREATE POLICY "Public can read selected settings"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (key IN ('business_info', 'site_defaults'));

DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings"
  ON public.settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT SELECT ON public.settings TO anon;

-- Admin table policies: allow existing admins to manage admin membership.
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read own row" ON public.admins;
DROP POLICY IF EXISTS "Admins can read admins table" ON public.admins;
CREATE POLICY "Admins can read admins table"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins me
      WHERE me.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can insert admins table" ON public.admins;
CREATE POLICY "Admins can insert admins table"
  ON public.admins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins me
      WHERE me.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can delete admins table" ON public.admins;
CREATE POLICY "Admins can delete admins table"
  ON public.admins
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins me
      WHERE me.id = auth.uid()
    )
  );

GRANT SELECT, INSERT, DELETE ON public.admins TO authenticated;

-- RPC: list admins with email from auth.users
CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT a.id, u.email, a.created_at
  FROM public.admins a
  LEFT JOIN auth.users u ON u.id = a.id
  WHERE EXISTS (
    SELECT 1 FROM public.admins me
    WHERE me.id = auth.uid()
  )
  ORDER BY a.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_admin_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;

-- RPC: find one auth.users row by email (admin only)
CREATE OR REPLACE FUNCTION public.find_auth_user_by_email(p_email text)
RETURNS TABLE (
  id uuid,
  email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT u.id, u.email
  FROM auth.users u
  WHERE EXISTS (
    SELECT 1 FROM public.admins me
    WHERE me.id = auth.uid()
  )
    AND lower(u.email) = lower(trim(p_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.find_auth_user_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_auth_user_by_email(text) TO authenticated;

NOTIFY pgrst, 'reload schema';

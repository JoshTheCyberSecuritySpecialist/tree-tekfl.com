-- =============================================================================
-- TREE TEK — Admin login setup (run in Supabase SQL Editor after first user exists)
-- =============================================================================
-- The app uses: 1) Supabase Auth (email + password)  2) a row in public.admins
-- where admins.id = auth.users.id (same UUID).
--
-- A) Create the admin user
--    Supabase Dashboard → Authentication → Users → "Add user" (or sign up if you
--    expose sign-up). Set email + password. Confirm the account if your project
--    requires email confirmation.
--
-- B) Create the admins table (if you do not have it yet)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow each admin to read their own row (needed for assertAdminUser after login)
DROP POLICY IF EXISTS "Admins can read own row" ON public.admins;
CREATE POLICY "Admins can read own row"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Without this, Postgres returns: permission denied for table admins
-- (RLS filters rows; GRANT lets role SELECT on the table.)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public.admins TO authenticated;

-- Optional: only service role / dashboard manages inserts; you often add the row manually:
-- INSERT INTO public.admins (id) VALUES ('paste-auth-user-uuid-here');

-- =============================================================================
-- C) Link your Auth user to admins (replace the UUID)
--    Find UUID: Authentication → Users → click user → copy User UID
-- =============================================================================
-- INSERT INTO public.admins (id)
-- VALUES ('00000000-0000-0000-0000-000000000000'::uuid)
-- ON CONFLICT (id) DO NOTHING;

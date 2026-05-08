/*
  Fix RLS recursion on public.admins.
  Problem:
    policies referenced public.admins from within public.admins policy expressions.
    Postgres raises: "infinite recursion detected in policy for relation admins".
*/

-- Helper used by policies; SECURITY DEFINER avoids recursive RLS evaluation.
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins a
    WHERE a.id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read admins table" ON public.admins;
DROP POLICY IF EXISTS "Admins can read own row" ON public.admins;
DROP POLICY IF EXISTS "Admins can insert admins table" ON public.admins;
DROP POLICY IF EXISTS "Admins can delete admins table" ON public.admins;

-- Keep login checks working (admin reads own row).
CREATE POLICY "Admins can read own row"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin_user());

-- Admin management actions for workspace settings.
CREATE POLICY "Admins can insert admins table"
  ON public.admins
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can delete admins table"
  ON public.admins
  FOR DELETE
  TO authenticated
  USING (public.is_admin_user());

GRANT SELECT, INSERT, DELETE ON public.admins TO authenticated;

NOTIFY pgrst, 'reload schema';

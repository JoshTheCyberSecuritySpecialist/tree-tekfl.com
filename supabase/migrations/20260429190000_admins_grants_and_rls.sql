/*
  # public.admins — grants + RLS

  PostgREST queries run as `authenticated` when a valid JWT is sent.
  Without GRANT SELECT on the table, Postgres returns:
    permission denied for table admins

  RLS policies filter rows; GRANT allows the role to attempt the query.
*/

CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read own row" ON public.admins;
CREATE POLICY "Admins can read own row"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Table-level privilege (required in addition to RLS)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public.admins TO authenticated;

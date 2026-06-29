
-- Category enum
DO $$ BEGIN
  CREATE TYPE public.app_resource_category AS ENUM ('governance', 'strategy', 'classroom', 'leadership');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Table
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  dek text NOT NULL DEFAULT '',
  body_html text NOT NULL DEFAULT '',
  cover_image_url text,
  category public.app_resource_category NOT NULL DEFAULT 'leadership',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  read_time_min int,
  author_name text NOT NULL DEFAULT 'Mike Peck',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX resources_status_published_at_idx ON public.resources (status, published_at DESC);
CREATE INDEX resources_category_idx ON public.resources (category);

-- Grants
GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;

-- RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published resources"
  ON public.resources FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can read all resources"
  ON public.resources FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert resources"
  ON public.resources FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update resources"
  ON public.resources FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resources"
  ON public.resources FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger (reuses existing public.handle_updated_at function)
CREATE TRIGGER resources_set_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

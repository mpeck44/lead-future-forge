
-- Create waitlist_leads table for email capture
CREATE TABLE public.waitlist_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text DEFAULT 'hero',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (visitors can submit without logging in)
CREATE POLICY "Anyone can submit to waitlist"
  ON public.waitlist_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read waitlist entries
CREATE POLICY "Admins can manage waitlist"
  ON public.waitlist_leads
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

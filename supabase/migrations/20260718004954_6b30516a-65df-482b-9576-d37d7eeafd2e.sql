CREATE TABLE public.client_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NULL,
  message text NOT NULL,
  stack text NULL,
  source text NULL,
  url text NULL,
  user_agent text NULL,
  kind text NOT NULL DEFAULT 'error',
  context jsonb NULL
);

GRANT SELECT ON public.client_error_logs TO authenticated;
GRANT ALL ON public.client_error_logs TO service_role;

ALTER TABLE public.client_error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all client error logs"
  ON public.client_error_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_client_error_logs_created_at ON public.client_error_logs (created_at DESC);
CREATE INDEX idx_client_error_logs_kind ON public.client_error_logs (kind);
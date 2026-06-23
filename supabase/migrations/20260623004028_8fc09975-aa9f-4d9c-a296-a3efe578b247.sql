CREATE TABLE public.routing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('door_selected','course_purchased','course_completed','ladder_followed','ladder_skipped')),
  course_key text,
  source text CHECK (source IS NULL OR source IN ('self_selected','audit')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.routing_events TO authenticated;
GRANT ALL ON public.routing_events TO service_role;

ALTER TABLE public.routing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own routing events"
  ON public.routing_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users read own routing events"
  ON public.routing_events FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX routing_events_user_created_idx
  ON public.routing_events (user_id, created_at DESC);
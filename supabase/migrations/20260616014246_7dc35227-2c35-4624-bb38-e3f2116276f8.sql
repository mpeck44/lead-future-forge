
-- 1. audit_attempts
CREATE TABLE public.audit_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_number int NOT NULL DEFAULT 1,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, attempt_number)
);
CREATE INDEX idx_audit_attempts_user ON public.audit_attempts(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_attempts TO authenticated;
GRANT ALL ON public.audit_attempts TO service_role;

ALTER TABLE public.audit_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own audit attempts" ON public.audit_attempts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own audit attempts" ON public.audit_attempts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own audit attempts" ON public.audit_attempts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own audit attempts" ON public.audit_attempts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_audit_attempts_updated_at
  BEFORE UPDATE ON public.audit_attempts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. audit_responses
CREATE TABLE public.audit_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.audit_attempts(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('fluency','strategy','action','governance','capacity')),
  item_key text NOT NULL,
  score int NOT NULL CHECK (score BETWEEN 1 AND 4),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, item_key)
);
CREATE INDEX idx_audit_responses_attempt_category ON public.audit_responses(attempt_id, category);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_responses TO authenticated;
GRANT ALL ON public.audit_responses TO service_role;

ALTER TABLE public.audit_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own audit responses" ON public.audit_responses
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.audit_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
  );
CREATE POLICY "Users insert own audit responses" ON public.audit_responses
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.audit_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
  );
CREATE POLICY "Users update own audit responses" ON public.audit_responses
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.audit_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.audit_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
  );
CREATE POLICY "Users delete own audit responses" ON public.audit_responses
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.audit_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())
  );

-- 3. profiles additions
ALTER TABLE public.profiles
  ADD COLUMN recommended_course text
    CHECK (recommended_course IS NULL OR recommended_course IN ('fluency','strategy','action')),
  ADD COLUMN recommendation_source text
    CHECK (recommendation_source IS NULL OR recommendation_source IN ('self_selected','audit'));

-- 4. Summary function
CREATE OR REPLACE FUNCTION public.get_audit_summary(_attempt_id uuid)
RETURNS TABLE (
  category text,
  avg_score numeric,
  item_count int,
  is_lowest boolean,
  recommended_course text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner uuid;
BEGIN
  SELECT user_id INTO _owner FROM public.audit_attempts WHERE id = _attempt_id;
  IF _owner IS NULL OR _owner <> auth.uid() THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH agg AS (
    SELECT
      r.category,
      AVG(r.score)::numeric AS avg_score,
      COUNT(*)::int AS item_count,
      CASE r.category
        WHEN 'fluency' THEN 1
        WHEN 'strategy' THEN 2
        WHEN 'action' THEN 3
        WHEN 'governance' THEN 4
        WHEN 'capacity' THEN 5
      END AS cat_order
    FROM public.audit_responses r
    WHERE r.attempt_id = _attempt_id
    GROUP BY r.category
  ),
  ranked AS (
    SELECT
      agg.*,
      ROW_NUMBER() OVER (ORDER BY agg.avg_score ASC, agg.cat_order ASC) AS rnk
    FROM agg
  )
  SELECT
    ranked.category,
    ranked.avg_score,
    ranked.item_count,
    (ranked.rnk = 1) AS is_lowest,
    CASE
      WHEN ranked.rnk = 1 THEN
        CASE ranked.category
          WHEN 'fluency' THEN 'fluency'
          WHEN 'strategy' THEN 'strategy'
          WHEN 'governance' THEN 'strategy'
          WHEN 'action' THEN 'action'
          WHEN 'capacity' THEN 'action'
        END
      ELSE NULL
    END AS recommended_course
  FROM ranked
  ORDER BY ranked.cat_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_audit_summary(uuid) TO authenticated;

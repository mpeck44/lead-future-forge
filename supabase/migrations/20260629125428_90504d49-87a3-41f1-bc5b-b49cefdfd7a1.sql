
CREATE OR REPLACE FUNCTION public.get_audit_attempts_admin()
RETURNS TABLE(
  attempt_id uuid,
  user_id uuid,
  email text,
  full_name text,
  role text,
  district_name text,
  started_at timestamptz,
  completed_at timestamptz,
  attempt_number int,
  response_count int,
  fluency_avg numeric,
  strategy_avg numeric,
  action_avg numeric,
  governance_avg numeric,
  capacity_avg numeric,
  lowest_category text,
  recommended_course text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH per_cat AS (
    SELECT r.attempt_id, r.category, AVG(r.score)::numeric AS avg_score, COUNT(*)::int AS cnt
    FROM public.audit_responses r
    GROUP BY r.attempt_id, r.category
  ),
  pivoted AS (
    SELECT
      a.id AS attempt_id,
      SUM(pc.cnt)::int AS response_count,
      MAX(CASE WHEN pc.category = 'fluency'    THEN pc.avg_score END) AS fluency_avg,
      MAX(CASE WHEN pc.category = 'strategy'   THEN pc.avg_score END) AS strategy_avg,
      MAX(CASE WHEN pc.category = 'action'     THEN pc.avg_score END) AS action_avg,
      MAX(CASE WHEN pc.category = 'governance' THEN pc.avg_score END) AS governance_avg,
      MAX(CASE WHEN pc.category = 'capacity'   THEN pc.avg_score END) AS capacity_avg
    FROM public.audit_attempts a
    LEFT JOIN per_cat pc ON pc.attempt_id = a.id
    GROUP BY a.id
  ),
  lowest AS (
    SELECT DISTINCT ON (pc.attempt_id)
      pc.attempt_id,
      pc.category AS lowest_category
    FROM per_cat pc
    ORDER BY pc.attempt_id,
      pc.avg_score ASC,
      CASE pc.category
        WHEN 'fluency' THEN 1
        WHEN 'strategy' THEN 2
        WHEN 'action' THEN 3
        WHEN 'governance' THEN 4
        WHEN 'capacity' THEN 5
      END ASC
  )
  SELECT
    a.id,
    a.user_id,
    p.email,
    p.full_name,
    p.role,
    p.district_name,
    a.started_at,
    a.completed_at,
    a.attempt_number,
    COALESCE(pv.response_count, 0),
    pv.fluency_avg,
    pv.strategy_avg,
    pv.action_avg,
    pv.governance_avg,
    pv.capacity_avg,
    l.lowest_category,
    CASE WHEN l.lowest_category IS NOT NULL THEN COALESCE(
      (SELECT c.slug FROM public.courses c
        WHERE c.audit_category::text = l.lowest_category AND c.is_published = true
        ORDER BY c.created_at ASC LIMIT 1),
      (SELECT c.slug FROM public.courses c
        WHERE c.audit_category::text = l.lowest_category
        ORDER BY c.created_at ASC LIMIT 1),
      CASE l.lowest_category
        WHEN 'governance' THEN (SELECT c.slug FROM public.courses c WHERE c.audit_category = 'strategy'::public.app_audit_category ORDER BY c.is_published DESC, c.created_at ASC LIMIT 1)
        WHEN 'capacity' THEN (SELECT c.slug FROM public.courses c WHERE c.audit_category = 'action'::public.app_audit_category ORDER BY c.is_published DESC, c.created_at ASC LIMIT 1)
        ELSE NULL
      END
    ) ELSE NULL END AS recommended_course
  FROM public.audit_attempts a
  LEFT JOIN public.profiles p ON p.id = a.user_id
  LEFT JOIN pivoted pv ON pv.attempt_id = a.id
  LEFT JOIN lowest l ON l.attempt_id = a.id
  ORDER BY a.completed_at DESC NULLS LAST, a.started_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_audit_attempt_detail_admin(_attempt_id uuid)
RETURNS TABLE(
  response_id uuid,
  category text,
  item_key text,
  score int,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT r.id, r.category, r.item_key, r.score, r.created_at
  FROM public.audit_responses r
  WHERE r.attempt_id = _attempt_id
  ORDER BY
    CASE r.category
      WHEN 'fluency' THEN 1
      WHEN 'strategy' THEN 2
      WHEN 'action' THEN 3
      WHEN 'governance' THEN 4
      WHEN 'capacity' THEN 5
    END,
    r.item_key;
END;
$$;

REVOKE ALL ON FUNCTION public.get_audit_attempts_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_audit_attempt_detail_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_audit_attempts_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_attempt_detail_admin(uuid) TO authenticated;

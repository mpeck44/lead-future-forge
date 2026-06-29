-- Add enum for audit categories matching audit_responses.category values
CREATE TYPE public.app_audit_category AS ENUM ('fluency', 'strategy', 'action', 'governance', 'capacity');

-- Add structured fields to courses
ALTER TABLE public.courses
  ADD COLUMN audit_category public.app_audit_category,
  ADD COLUMN role_fit text[] NOT NULL DEFAULT '{}',
  ADD COLUMN requires_foundations boolean NOT NULL DEFAULT true;

-- Backfill existing courses
UPDATE public.courses SET audit_category = NULL, requires_foundations = false WHERE slug = 'foundations';
UPDATE public.courses SET audit_category = 'fluency'::public.app_audit_category, requires_foundations = true WHERE slug = 'fluency';
UPDATE public.courses SET audit_category = 'strategy'::public.app_audit_category, requires_foundations = true WHERE slug = 'strategy';
UPDATE public.courses SET audit_category = 'action'::public.app_audit_category, requires_foundations = true WHERE slug = 'action';

-- Drop the legacy free-form tags column
ALTER TABLE public.courses DROP COLUMN tags;

-- Rewrite audit summary to read from courses.audit_category
CREATE OR REPLACE FUNCTION public.get_audit_summary(_attempt_id uuid)
 RETURNS TABLE(category text, avg_score numeric, item_count integer, is_lowest boolean, recommended_course text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      WHEN ranked.rnk = 1 THEN COALESCE(
        -- direct match on audit_category
        (SELECT c.slug FROM public.courses c
         WHERE c.audit_category::text = ranked.category AND c.is_published = true
         ORDER BY c.created_at ASC LIMIT 1),
        (SELECT c.slug FROM public.courses c
         WHERE c.audit_category::text = ranked.category
         ORDER BY c.created_at ASC LIMIT 1),
        -- fallback: governance -> strategy course, capacity -> action course
        CASE ranked.category
          WHEN 'governance' THEN (SELECT c.slug FROM public.courses c WHERE c.audit_category = 'strategy'::public.app_audit_category ORDER BY c.is_published DESC, c.created_at ASC LIMIT 1)
          WHEN 'capacity' THEN (SELECT c.slug FROM public.courses c WHERE c.audit_category = 'action'::public.app_audit_category ORDER BY c.is_published DESC, c.created_at ASC LIMIT 1)
          ELSE NULL
        END
      )
      ELSE NULL
    END AS recommended_course
  FROM ranked
  ORDER BY ranked.cat_order;
END;
$function$;
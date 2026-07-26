-- Drop redundant permissive INSERT policy; waitlist submissions must go through upsert_waitlist_lead RPC
DROP POLICY IF EXISTS "Anyone can submit to waitlist" ON public.waitlist_leads;

-- Restrict SECURITY DEFINER helpers that don't need anon access
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_audit_summary(uuid) FROM anon, PUBLIC;

-- Keep authenticated + service_role grants intact
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_audit_summary(uuid) TO authenticated, service_role;
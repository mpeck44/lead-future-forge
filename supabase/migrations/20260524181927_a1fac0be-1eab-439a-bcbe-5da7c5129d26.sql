
-- Prevent privilege escalation on user_roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles AS RESTRICTIVE
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles AS RESTRICTIVE
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles AS RESTRICTIVE
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Restrict listing of lesson-images bucket (public file URLs bypass RLS and still work)
DROP POLICY IF EXISTS "Lesson images are publicly readable" ON storage.objects;

CREATE POLICY "Admins can list lesson images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'lesson-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Revoke EXECUTE on trigger-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;

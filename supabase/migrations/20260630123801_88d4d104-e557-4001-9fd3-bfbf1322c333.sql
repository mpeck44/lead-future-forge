-- Harden enrollments: add a RESTRICTIVE UPDATE policy so non-admins can never
-- update enrollment rows (status, amount_paid, course_id), even if a future
-- permissive policy is added that might otherwise allow it.
CREATE POLICY "Only admins may update enrollments (restrictive)"
ON public.enrollments
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
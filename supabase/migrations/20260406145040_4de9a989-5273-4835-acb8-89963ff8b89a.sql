
-- Fix 1: Remove the overly broad "Admins can manage waitlist" policy that uses {public} role
-- and replace with proper authenticated-only admin policy + keep anon insert
DROP POLICY IF EXISTS "Admins can manage waitlist" ON public.waitlist_leads;

CREATE POLICY "Admins can manage waitlist"
ON public.waitlist_leads
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Restrict lesson content to enrolled users (keep public access to basic metadata)
DROP POLICY IF EXISTS "Lessons are viewable when published and course is published" ON public.lessons;

-- Enrolled users can view full lesson content for published courses
CREATE POLICY "Enrolled users can view published lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM modules
    JOIN courses ON courses.id = modules.course_id
    JOIN enrollments ON enrollments.course_id = courses.id
    WHERE modules.id = lessons.module_id
      AND courses.is_published = true
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
  )
);

-- Fix 3: Tighten portfolio_items policies from {public} to proper roles
DROP POLICY IF EXISTS "Admins can manage portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Users can create own portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Users can delete own portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Users can update own portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Users can view own portfolio items" ON public.portfolio_items;

CREATE POLICY "Admins can manage portfolio items"
ON public.portfolio_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own portfolio items"
ON public.portfolio_items FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own portfolio items"
ON public.portfolio_items FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio items"
ON public.portfolio_items FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio items"
ON public.portfolio_items FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Fix 4: Tighten question_responses and reflection_responses from {public} to authenticated
DROP POLICY IF EXISTS "Admins can view all question responses" ON public.question_responses;
DROP POLICY IF EXISTS "Users can manage own question responses" ON public.question_responses;

CREATE POLICY "Admins can view all question responses"
ON public.question_responses FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage own question responses"
ON public.question_responses FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all reflections" ON public.reflection_responses;
DROP POLICY IF EXISTS "Users can manage own reflections" ON public.reflection_responses;

CREATE POLICY "Admins can view all reflections"
ON public.reflection_responses FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage own reflections"
ON public.reflection_responses FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

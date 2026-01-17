-- Drop the existing policy that doesn't check lessons.is_published
DROP POLICY IF EXISTS "Lessons are viewable when course is published" ON public.lessons;

-- Create new policy that checks BOTH lesson and course publication status
CREATE POLICY "Lessons are viewable when published and course is published" 
ON public.lessons 
FOR SELECT 
USING (
  lessons.is_published = true 
  AND EXISTS (
    SELECT 1 FROM public.modules
    JOIN public.courses ON courses.id = modules.course_id
    WHERE modules.id = lessons.module_id 
    AND courses.is_published = true
  )
);
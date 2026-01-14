-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  template_url TEXT,
  sequence_order INTEGER NOT NULL,
  estimated_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lessons are viewable when their parent course is published
CREATE POLICY "Lessons are viewable when course is published" 
ON public.lessons FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.modules
    JOIN public.courses ON courses.id = modules.course_id
    WHERE modules.id = lessons.module_id 
    AND courses.is_published = true
  )
);

-- Admins can manage lessons
CREATE POLICY "Admins can manage lessons" 
ON public.lessons FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER on_lesson_updated
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
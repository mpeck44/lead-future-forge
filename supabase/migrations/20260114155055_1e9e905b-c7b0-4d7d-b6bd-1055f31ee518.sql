-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount_paid INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'refunded', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" 
ON public.enrollments FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can enroll themselves (for purchasing courses)
CREATE POLICY "Users can enroll themselves" 
ON public.enrollments FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage enrollments" 
ON public.enrollments FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER on_enrollment_updated
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
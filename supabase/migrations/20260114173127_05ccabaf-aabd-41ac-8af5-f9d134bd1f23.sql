-- Create portfolio_items table for user deliverables
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'shared')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own portfolio items
CREATE POLICY "Users can view own portfolio items"
ON public.portfolio_items FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own portfolio items
CREATE POLICY "Users can create own portfolio items"
ON public.portfolio_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own portfolio items
CREATE POLICY "Users can update own portfolio items"
ON public.portfolio_items FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own portfolio items
CREATE POLICY "Users can delete own portfolio items"
ON public.portfolio_items FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all portfolio items
CREATE POLICY "Admins can manage portfolio items"
ON public.portfolio_items FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_portfolio_items_updated_at
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for portfolio files
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', false);

-- Storage policies for portfolio bucket
CREATE POLICY "Users can view own portfolio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own portfolio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own portfolio files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own portfolio files"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
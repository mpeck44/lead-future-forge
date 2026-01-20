-- Create question_responses table for storing user answers to question-type lessons
CREATE TABLE public.question_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  response text NOT NULL DEFAULT '',
  skipped boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;

-- Users can manage their own question responses
CREATE POLICY "Users can manage own question responses" 
ON public.question_responses 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all question responses
CREATE POLICY "Admins can view all question responses" 
ON public.question_responses 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_question_responses_updated_at
BEFORE UPDATE ON public.question_responses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add skipped column to reflection_responses for skip tracking
ALTER TABLE public.reflection_responses 
ADD COLUMN IF NOT EXISTS skipped boolean DEFAULT false;
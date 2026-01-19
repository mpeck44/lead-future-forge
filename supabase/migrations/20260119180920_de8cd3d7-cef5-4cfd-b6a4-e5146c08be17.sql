-- Phase 1: Extend lessons table with new fields for enhanced lesson types
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS learning_objective text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS key_takeaways text[];
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS resource_type text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS resource_name text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS download_button_text text DEFAULT 'Download Template';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS completion_type text DEFAULT 'manual';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_quick_start boolean DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_first_deliverable boolean DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS auto_advance boolean DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS require_completion boolean DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_transcript text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS character_limit integer;

-- Phase 2: Extend modules table with new fields
ALTER TABLE modules ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS deliverable_name text;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS path_type text;

-- Phase 3: Create reflection_responses table for storing user journal entries
CREATE TABLE IF NOT EXISTS reflection_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  response text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS on reflection_responses
ALTER TABLE reflection_responses ENABLE ROW LEVEL SECURITY;

-- Users can manage their own reflections
CREATE POLICY "Users can manage own reflections" ON reflection_responses
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all reflections
CREATE POLICY "Admins can view all reflections" ON reflection_responses
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on reflection_responses
CREATE TRIGGER update_reflection_responses_updated_at
BEFORE UPDATE ON reflection_responses
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
-- Add lesson_type column to support different content types (material, question, quiz)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_type TEXT DEFAULT 'material';

-- Add is_published column for draft/published status on individual lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
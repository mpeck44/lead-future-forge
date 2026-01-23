-- Add unique constraint for user_id + lesson_id to enable upsert
ALTER TABLE portfolio_items 
ADD CONSTRAINT portfolio_items_user_lesson_unique 
UNIQUE (user_id, lesson_id);
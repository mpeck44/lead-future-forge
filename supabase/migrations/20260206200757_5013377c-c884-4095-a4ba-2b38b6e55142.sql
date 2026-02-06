
-- Add new columns to waitlist_leads
ALTER TABLE public.waitlist_leads
  ADD COLUMN full_name text,
  ADD COLUMN role text,
  ADD COLUMN interested_courses text[] DEFAULT '{}',
  ADD COLUMN notes text;

-- Create an upsert function for waitlist signups
-- This handles returning visitors by appending new course interests
CREATE OR REPLACE FUNCTION public.upsert_waitlist_lead(
  _email text,
  _full_name text DEFAULT NULL,
  _role text DEFAULT NULL,
  _source text DEFAULT 'hero',
  _course_slug text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  existing_record waitlist_leads%ROWTYPE;
BEGIN
  -- Check if email already exists
  SELECT * INTO existing_record FROM waitlist_leads WHERE email = _email;
  
  IF existing_record.id IS NOT NULL THEN
    -- Update existing record: append course if not already present
    UPDATE waitlist_leads
    SET
      full_name = COALESCE(_full_name, existing_record.full_name),
      role = COALESCE(_role, existing_record.role),
      interested_courses = CASE
        WHEN _course_slug IS NOT NULL AND NOT (existing_record.interested_courses @> ARRAY[_course_slug])
        THEN array_append(COALESCE(existing_record.interested_courses, '{}'), _course_slug)
        ELSE COALESCE(existing_record.interested_courses, '{}')
      END
    WHERE id = existing_record.id;
    
    result = jsonb_build_object('status', 'updated', 'id', existing_record.id);
  ELSE
    -- Insert new record
    INSERT INTO waitlist_leads (email, full_name, role, source, interested_courses)
    VALUES (
      _email,
      _full_name,
      _role,
      _source,
      CASE WHEN _course_slug IS NOT NULL THEN ARRAY[_course_slug] ELSE '{}' END
    )
    RETURNING jsonb_build_object('status', 'created', 'id', id) INTO result;
  END IF;
  
  RETURN result;
END;
$$;

-- Allow anonymous users to call the upsert function
GRANT EXECUTE ON FUNCTION public.upsert_waitlist_lead TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_waitlist_lead TO authenticated;

-- Allow admins to update waitlist_leads (for adding notes)
-- The existing "Admins can manage waitlist" ALL policy already covers this

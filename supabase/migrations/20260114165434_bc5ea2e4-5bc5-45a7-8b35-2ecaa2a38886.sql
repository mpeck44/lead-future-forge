-- Drop the old constraint and add new one with all role values from the signup form
ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY[
  'superintendent'::text, 
  'principal'::text, 
  'assistant_principal'::text,
  'curriculum_director'::text, 
  'tech_director'::text,
  'technology_director'::text,
  'teacher_leader'::text,
  'other'::text
]));
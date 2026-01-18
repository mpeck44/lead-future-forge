-- Add status column to profiles for user status management
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Add check constraint for valid status values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'inactive', 'suspended'));

-- Create RLS policy for admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policy for admins to update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
/*
# Ensure User Profiles Exist

## Problem
Users can log in via custom JWT auth, but their profiles are not automatically created.
This causes:
1. is_admin_by_id() returns false (user not in profiles table)
2. Gift code creation fails (foreign key constraint violation)

## Solution
1. Make created_by field optional in gift_codes table
2. Create a function to ensure profile exists
3. Update is_admin_by_id to handle missing profiles gracefully
*/

-- Make created_by optional in gift_codes
ALTER TABLE gift_codes ALTER COLUMN created_by DROP NOT NULL;

-- Create function to ensure profile exists
CREATE OR REPLACE FUNCTION ensure_profile_exists(
  p_user_id uuid,
  p_email text,
  p_role user_role DEFAULT 'user'::user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, role, created_at, updated_at)
  VALUES (p_user_id, p_email, p_role, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
END;
$$;

-- Update is_admin_by_id to be more robust
CREATE OR REPLACE FUNCTION is_admin_by_id(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'::user_role FROM profiles WHERE id = user_id),
    false
  );
$$;

COMMENT ON FUNCTION ensure_profile_exists IS 'Ensure user profile exists in profiles table';
COMMENT ON FUNCTION is_admin_by_id IS 'Check if user is admin, returns false if profile does not exist';

/*
# Decouple User Architecture

## Problem Analysis
The system has tight coupling between three separate identity systems:
1. users table (managed by Edge Functions, ID: 18bd1fdc-a571-4ea1-bf58-ae5f844eb480)
2. profiles table (manually created, ID: ab591cd0-bcff-40f4-bc2f-20ce58cb07eb)
3. gift_codes.created_by (foreign key to profiles.id)

This causes:
- Gift code creation fails (foreign key constraint violation)
- Payment toggle fails (is_admin_by_id can't find user)
- System requires perfect synchronization between tables

## Solution
Decouple the architecture by:
1. Remove foreign key constraint on gift_codes.created_by
2. Make admin checks work with email instead of ID
3. Allow system to function without perfect profile sync

## Changes
1. Drop foreign key constraint
2. Create email-based admin check function
3. Update toggle_payment_system to use email-based check
4. Update is_admin_by_id to be more flexible
*/

-- 1. Drop the foreign key constraint on gift_codes.created_by
ALTER TABLE gift_codes DROP CONSTRAINT IF EXISTS gift_codes_created_by_fkey;

-- 2. Create email-based admin check function
CREATE OR REPLACE FUNCTION is_admin_by_email(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Check if email is admin in profiles table OR is the hardcoded admin email
  SELECT COALESCE(
    (SELECT role = 'admin'::user_role FROM profiles WHERE email = user_email),
    user_email = '1062250152@qq.com'
  );
$$;

-- 3. Update is_admin_by_id to check both users and profiles
CREATE OR REPLACE FUNCTION is_admin_by_id(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  -- First try to get email from users table
  SELECT email INTO user_email FROM users WHERE id = user_id;
  
  -- If not found in users, try profiles
  IF user_email IS NULL THEN
    SELECT email INTO user_email FROM profiles WHERE id = user_id;
  END IF;
  
  -- If still not found, return false
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if this email is admin
  RETURN is_admin_by_email(user_email);
END;
$$;

-- 4. Update toggle_payment_system to use email-based check
DROP FUNCTION IF EXISTS toggle_payment_system(boolean, uuid);

CREATE FUNCTION toggle_payment_system(
  enabled boolean,
  user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check admin permission using the improved is_admin_by_id
  IF NOT is_admin_by_id(user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can toggle payment system';
  END IF;

  -- Upsert the payment system setting
  INSERT INTO system_settings (key, value, updated_at)
  VALUES ('payment_enabled', to_jsonb(enabled), now())
  ON CONFLICT (key) 
  DO UPDATE SET 
    value = to_jsonb(enabled),
    updated_at = now();

  -- Return success response
  result := jsonb_build_object(
    'success', true,
    'enabled', enabled,
    'updated_at', now()
  );

  RETURN result;
END;
$$;

-- 5. Add comments
COMMENT ON FUNCTION is_admin_by_email IS 'Check if email is admin, works with hardcoded admin email';
COMMENT ON FUNCTION is_admin_by_id IS 'Check if user ID is admin, checks both users and profiles tables';
COMMENT ON FUNCTION toggle_payment_system(boolean, uuid) IS 'Toggle payment system, uses flexible admin check';

-- 6. Add index on users.email for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

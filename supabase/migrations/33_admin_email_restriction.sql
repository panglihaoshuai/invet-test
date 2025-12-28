/*
# Admin Email Restriction

## Purpose
Ensure only 1062250152@qq.com can access admin dashboard after Supabase Auth migration.

## Changes
1. Create function to check admin email
2. Update admin check functions
3. Ensure admin email is case-insensitive
*/

-- 1. Create function to check if email is admin email
CREATE OR REPLACE FUNCTION public.is_admin_email(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
IMMUTABLE
AS $$
  SELECT LOWER(user_email) = '1062250152@qq.com';
$$;

-- 2. Update is_admin_by_email to prioritize admin email check
CREATE OR REPLACE FUNCTION public.is_admin_by_email(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    LOWER(user_email) = '1062250152@qq.com' OR
    COALESCE(
      (SELECT role = 'admin'::public.user_role FROM public.profiles WHERE LOWER(email) = LOWER(user_email)),
      EXISTS(SELECT 1 FROM public.admin_emails WHERE email = LOWER(user_email)),
      false
    );
$$;

-- 3. Update is_admin_by_id to check admin email
CREATE OR REPLACE FUNCTION public.is_admin_by_id(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check admin email first (highest priority)
  IF LOWER(user_email) = '1062250152@qq.com' THEN
    RETURN true;
  END IF;
  
  -- Check if admin by profile role
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'::public.user_role
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if admin by admin_emails table
  IF EXISTS (
    SELECT 1 FROM public.admin_emails 
    WHERE email = LOWER(user_email)
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 4. Update is_admin_by_auth_uid to check admin email
CREATE OR REPLACE FUNCTION public.is_admin_by_auth_uid()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    (SELECT email FROM auth.users WHERE id = auth.uid()) = '1062250152@qq.com' OR
    COALESCE(
      (SELECT role = 'admin'::public.user_role FROM public.profiles WHERE id = auth.uid()),
      EXISTS(
        SELECT 1 FROM public.admin_emails 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      ),
      false
    );
$$;

-- Comments
COMMENT ON FUNCTION public.is_admin_email IS 'Check if email is the admin email (1062250152@qq.com)';


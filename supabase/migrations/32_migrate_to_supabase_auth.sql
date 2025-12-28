/*
# Migrate to Supabase Auth

## Purpose
Migrate from custom authentication system to Supabase Auth.
This migration ensures compatibility with Supabase Auth while preserving existing data.

## Changes
1. Update profiles table to reference auth.users instead of users table
2. Ensure all foreign keys point to auth.users.id
3. Create helper functions for admin checks using auth.users
4. Update RLS policies to work with auth.users

## Note
- Existing users table data should be migrated manually using Supabase Admin API
- This migration only updates schema and policies
*/

-- 1. Ensure profiles table references auth.users
-- Drop existing foreign key if it references users table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add foreign key to auth.users
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Update gift_code_redemptions to reference auth.users via profiles
-- The user_id already references profiles.id, which now references auth.users.id
-- So no change needed, but ensure the constraint is correct
ALTER TABLE public.gift_code_redemptions DROP CONSTRAINT IF EXISTS gift_code_redemptions_user_id_fkey;
ALTER TABLE public.gift_code_redemptions 
  ADD CONSTRAINT gift_code_redemptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Update test_results to reference auth.users via profiles
-- If test_results.user_id references users table, we need to update it
-- First check if it exists and drop it
DO $$
BEGIN
  -- Check if test_results has user_id column referencing users table
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'test_results_user_id_fkey' 
    AND table_name = 'test_results'
  ) THEN
    ALTER TABLE public.test_results DROP CONSTRAINT test_results_user_id_fkey;
    ALTER TABLE public.test_results 
      ADD CONSTRAINT test_results_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Update orders to reference auth.users via profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_user_id_fkey' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_user_id_fkey;
    ALTER TABLE public.orders 
      ADD CONSTRAINT orders_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Update deepseek_analyses to reference auth.users via profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'deepseek_analyses_user_id_fkey' 
    AND table_name = 'deepseek_analyses'
  ) THEN
    ALTER TABLE public.deepseek_analyses DROP CONSTRAINT deepseek_analyses_user_id_fkey;
    ALTER TABLE public.deepseek_analyses 
      ADD CONSTRAINT deepseek_analyses_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Create function to check if user is admin by auth.uid()
CREATE OR REPLACE FUNCTION public.is_admin_by_auth_uid()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'::public.user_role FROM public.profiles WHERE id = auth.uid()),
    EXISTS(
      SELECT 1 FROM public.admin_emails 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ),
    (SELECT email FROM auth.users WHERE id = auth.uid()) = '1062250152@qq.com'
  );
$$;

-- 7. Update is_admin_by_id function to work with auth.users
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
  
  -- Check if admin by profile role
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'::public.user_role
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if admin by email
  IF user_email = '1062250152@qq.com' THEN
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

-- 8. Create function to check admin by email (for compatibility)
CREATE OR REPLACE FUNCTION public.is_admin_by_email(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'::public.user_role FROM public.profiles WHERE LOWER(email) = LOWER(user_email)),
    EXISTS(SELECT 1 FROM public.admin_emails WHERE email = LOWER(user_email)),
    LOWER(user_email) = '1062250152@qq.com'
  );
$$;

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.admin_emails TO authenticated;

-- 10. Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for profiles (users can read their own profile)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Create RLS policy for profiles (users can update their own profile)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Comments
COMMENT ON FUNCTION public.is_admin_by_auth_uid IS 'Check if current authenticated user is admin';
COMMENT ON FUNCTION public.is_admin_by_id IS 'Check if user by ID is admin (works with auth.users)';
COMMENT ON FUNCTION public.is_admin_by_email IS 'Check if user by email is admin';


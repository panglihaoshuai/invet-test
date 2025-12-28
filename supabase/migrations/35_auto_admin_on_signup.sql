/*
# Auto Admin on Signup

## Purpose
Automatically set user as admin when they sign up with admin email (1062250152@qq.com).

## Changes
1. Create trigger function to auto-set admin role on profile creation
2. Create trigger to call function when profile is created
*/

-- 1. Create function to auto-set admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Get email from auth.users
  DECLARE
    user_email text;
  BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
    
    -- If email is admin email, set role to admin
    IF LOWER(user_email) = '1062250152@qq.com' THEN
      NEW.role = 'admin'::public.user_role;
    ELSE
      NEW.role = 'user'::public.user_role;
    END IF;
  END;
  
  RETURN NEW;
END;
$$;

-- 2. Create trigger to call function before profile insert
DROP TRIGGER IF EXISTS on_auth_user_created ON public.profiles;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Also update existing profiles if needed
UPDATE public.profiles
SET role = 'admin'::public.user_role
WHERE LOWER(email) = '1062250152@qq.com'
  AND role != 'admin'::public.user_role;

-- Comments
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically set admin role for admin email on signup';
COMMENT ON TRIGGER on_auth_user_created ON public.profiles IS 'Trigger to auto-set admin role when profile is created';


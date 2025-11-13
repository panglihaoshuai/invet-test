/*
# Setup Auto Admin Email Assignment

## Changes
1. Update admin_email in system_config to 1062250152@QQ.COM
2. Create trigger function to automatically assign admin role when this email registers
3. Only the specified admin email gets auto admin role

## Security
- Only the email in system_config.admin_email gets auto admin role
- Other users remain as regular users unless manually promoted by admin
*/

-- Update admin email configuration
UPDATE system_config 
SET config_value = '1062250152@qq.com'
WHERE config_key = 'admin_email';

-- Create function to auto-assign admin role
CREATE OR REPLACE FUNCTION auto_assign_admin_role()
RETURNS TRIGGER AS $$
DECLARE
  admin_email_config TEXT;
BEGIN
  -- Get the admin email from system_config
  SELECT config_value INTO admin_email_config
  FROM system_config
  WHERE config_key = 'admin_email';
  
  -- If the new user's email matches the admin email, set role to admin
  IF LOWER(NEW.email) = LOWER(admin_email_config) THEN
    NEW.role := 'admin'::user_role;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_assign_admin_role ON profiles;

-- Create trigger on profiles table
CREATE TRIGGER trigger_auto_assign_admin_role
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_admin_role();

-- Update existing profile if it exists
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE LOWER(email) = '1062250152@qq.com';

/*
# Setup Auto Admin Email Assignment (renumbered)
*/
UPDATE system_config 
SET config_value = '1062250152@qq.com'
WHERE config_key = 'admin_email';

CREATE OR REPLACE FUNCTION auto_assign_admin_role()
RETURNS TRIGGER AS $$
DECLARE
  admin_email_config TEXT;
BEGIN
  SELECT config_value INTO admin_email_config
  FROM system_config
  WHERE config_key = 'admin_email';
  IF LOWER(NEW.email) = LOWER(admin_email_config) THEN
    NEW.role := 'admin'::user_role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_assign_admin_role ON profiles;
CREATE TRIGGER trigger_auto_assign_admin_role
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_admin_role();

UPDATE profiles 
SET role = 'admin'::user_role 
WHERE LOWER(email) = '1062250152@qq.com';

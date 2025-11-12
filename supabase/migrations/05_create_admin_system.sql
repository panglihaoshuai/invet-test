/*
# Admin System and Security Features

## New Tables
1. `system_settings` - System configuration including payment toggle
2. `test_submissions` - Track test submissions with IP and metadata
3. `admin_logs` - Audit log for admin actions

## Modified Tables
- `orders` - Add ip_address and user_agent fields

## Security Features
- Rate limiting tracking
- Admin role management
- Audit logging

## Notes
- Admin users can view all statistics
- Payment system can be toggled on/off
- IP addresses are tracked for security
*/

-- Create user_role enum if not exists
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table if not exists (for user roles)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create admin helper function
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Profiles policies
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) 
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- System settings policies
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Everyone can view system settings" ON system_settings;
CREATE POLICY "Everyone can view system settings" ON system_settings
  FOR SELECT TO authenticated USING (true);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
  ('payment_enabled', 'true'::jsonb, '支付系统开关'),
  ('rate_limit_login', '{"max_attempts": 5, "window_minutes": 15}'::jsonb, '登录速率限制'),
  ('rate_limit_payment', '{"max_attempts": 3, "window_minutes": 60}'::jsonb, '支付速率限制')
ON CONFLICT (setting_key) DO NOTHING;

-- Test submissions tracking table
CREATE TABLE IF NOT EXISTS test_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  test_type text NOT NULL, -- 'personality', 'math_finance', 'risk_preference', 'trading'
  ip_address text,
  user_agent text,
  country text,
  city text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on test_submissions
ALTER TABLE test_submissions ENABLE ROW LEVEL SECURITY;

-- Test submissions policies
DROP POLICY IF EXISTS "Admins can view all test submissions" ON test_submissions;
CREATE POLICY "Admins can view all test submissions" ON test_submissions
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own test submissions" ON test_submissions;
CREATE POLICY "Users can view own test submissions" ON test_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own test submissions" ON test_submissions;
CREATE POLICY "Users can insert own test submissions" ON test_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_submissions_user_id ON test_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_submissions_created_at ON test_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_submissions_ip_address ON test_submissions(ip_address);

-- Admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Admin logs policies
DROP POLICY IF EXISTS "Admins can view all logs" ON admin_logs;
CREATE POLICY "Admins can view all logs" ON admin_logs
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert logs" ON admin_logs;
CREATE POLICY "Admins can insert logs" ON admin_logs
  FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);

-- Add IP address and user agent to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city text;

-- Create statistics view for admin dashboard
CREATE OR REPLACE VIEW admin_statistics AS
SELECT
  (SELECT COUNT(*) FROM test_submissions) as total_tests,
  (SELECT COUNT(DISTINCT user_id) FROM test_submissions) as unique_users,
  (SELECT COUNT(*) FROM orders WHERE status = 'completed') as total_payments,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed') as total_revenue,
  (SELECT COUNT(*) FROM test_submissions WHERE created_at > now() - interval '24 hours') as tests_today,
  (SELECT COUNT(*) FROM orders WHERE status = 'completed' AND completed_at > now() - interval '24 hours') as payments_today;

-- Grant access to admin statistics view
GRANT SELECT ON admin_statistics TO authenticated;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action text,
  p_target_type text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can log actions';
  END IF;

  INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details, p_ip_address)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Create function to toggle payment system
CREATE OR REPLACE FUNCTION toggle_payment_system(enabled boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can toggle payment system';
  END IF;

  -- Update setting
  UPDATE system_settings
  SET setting_value = to_jsonb(enabled),
      updated_by = auth.uid(),
      updated_at = now()
  WHERE setting_key = 'payment_enabled';

  -- Log action
  PERFORM log_admin_action(
    'toggle_payment_system',
    'system_settings',
    NULL,
    jsonb_build_object('enabled', enabled),
    NULL
  );

  RETURN jsonb_build_object('success', true, 'enabled', enabled);
END;
$$;

-- Create function to get payment system status
CREATE OR REPLACE FUNCTION get_payment_system_status()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT (setting_value)::boolean
  FROM system_settings
  WHERE setting_key = 'payment_enabled';
$$;

-- Comments
COMMENT ON TABLE profiles IS '用户配置表，包含角色信息';
COMMENT ON TABLE system_settings IS '系统设置表，包含支付开关等配置';
COMMENT ON TABLE test_submissions IS '测试提交记录，用于统计和安全追踪';
COMMENT ON TABLE admin_logs IS '管理员操作日志';
COMMENT ON FUNCTION is_admin IS '检查用户是否为管理员';
COMMENT ON FUNCTION log_admin_action IS '记录管理员操作';
COMMENT ON FUNCTION toggle_payment_system IS '切换支付系统开关';
COMMENT ON FUNCTION get_payment_system_status IS '获取支付系统状态';

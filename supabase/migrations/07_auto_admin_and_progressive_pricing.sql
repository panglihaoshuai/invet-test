/*
# Automatic Admin Assignment and Progressive Pricing

## Features
1. Automatic admin role assignment for specified email
2. Progressive pricing system (¥3.99 → ¥2.99 → ¥0.99)

## New Tables
- `system_config` - Store admin email configuration

## New Functions
- `get_user_analysis_price()` - Calculate price based on purchase history
- `handle_new_user()` - Trigger function to auto-assign admin role

## Pricing Logic
- 1st analysis: ¥3.99 (399 cents)
- 2nd analysis: ¥2.99 (299 cents)
- 3rd+ analysis: ¥0.99 (99 cents)
*/

-- Create system_config table for admin email
CREATE TABLE IF NOT EXISTS system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert admin email configuration
INSERT INTO system_config (config_key, config_value, description)
VALUES ('admin_email', 'your-admin-email@example.com', '管理员邮箱，注册后自动成为管理员')
ON CONFLICT (config_key) DO NOTHING;

-- Create trigger function to auto-assign admin role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email text;
BEGIN
  -- Get admin email from config
  SELECT config_value INTO admin_email
  FROM system_config
  WHERE config_key = 'admin_email';

  -- Check if new user's email matches admin email
  IF NEW.email = admin_email THEN
    NEW.role := 'admin'::user_role;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to calculate user's analysis price based on purchase history
CREATE OR REPLACE FUNCTION get_user_analysis_price(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed_count integer;
  price integer;
BEGIN
  -- Count completed orders for this user
  SELECT COUNT(*)::integer INTO completed_count
  FROM orders
  WHERE user_id = p_user_id 
    AND status = 'completed'
    AND items::jsonb @> '[{"type": "deepseek_analysis"}]'::jsonb;

  -- Calculate price based on purchase count
  IF completed_count = 0 THEN
    price := 399; -- ¥3.99 for first purchase
  ELSIF completed_count = 1 THEN
    price := 299; -- ¥2.99 for second purchase
  ELSE
    price := 99;  -- ¥0.99 for third and subsequent purchases
  END IF;

  RETURN price;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_analysis_price(uuid) TO authenticated;

-- Create view to show user pricing info
CREATE OR REPLACE VIEW user_pricing_info AS
SELECT 
  p.id as user_id,
  p.email,
  COUNT(o.id) FILTER (WHERE o.status = 'completed' AND o.items::jsonb @> '[{"type": "deepseek_analysis"}]'::jsonb) as completed_analyses,
  CASE 
    WHEN COUNT(o.id) FILTER (WHERE o.status = 'completed' AND o.items::jsonb @> '[{"type": "deepseek_analysis"}]'::jsonb) = 0 THEN 399
    WHEN COUNT(o.id) FILTER (WHERE o.status = 'completed' AND o.items::jsonb @> '[{"type": "deepseek_analysis"}]'::jsonb) = 1 THEN 299
    ELSE 99
  END as next_price
FROM profiles p
LEFT JOIN orders o ON o.user_id = p.id
GROUP BY p.id, p.email;

-- Grant access to view
GRANT SELECT ON user_pricing_info TO authenticated;

-- Add RLS policy for user_pricing_info
ALTER VIEW user_pricing_info SET (security_invoker = on);

-- Update admin_statistics view to include pricing info
CREATE OR REPLACE VIEW admin_statistics AS
SELECT
  (SELECT COUNT(*) FROM test_submissions) as total_tests,
  (SELECT COUNT(DISTINCT user_id) FROM test_submissions) as unique_users,
  (SELECT COUNT(*) FROM orders WHERE status = 'completed') as total_payments,
  (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed') as total_revenue,
  (SELECT COUNT(*) FROM test_submissions WHERE created_at > now() - interval '24 hours') as tests_today,
  (SELECT COUNT(*) FROM orders WHERE status = 'completed' AND completed_at > now() - interval '24 hours') as payments_today,
  (SELECT COUNT(*) FROM orders WHERE status = 'completed' AND total_amount = 399) as first_time_purchases,
  (SELECT COUNT(*) FROM orders WHERE status = 'completed' AND total_amount = 299) as second_time_purchases,
  (SELECT COUNT(*) FROM orders WHERE status = 'completed' AND total_amount = 99) as repeat_purchases;

-- Comments
COMMENT ON TABLE system_config IS '系统配置表，存储管理员邮箱等配置';
COMMENT ON FUNCTION handle_new_user IS '自动为指定邮箱分配管理员角色';
COMMENT ON FUNCTION get_user_analysis_price IS '根据用户购买历史计算分析价格';
COMMENT ON VIEW user_pricing_info IS '用户定价信息视图';

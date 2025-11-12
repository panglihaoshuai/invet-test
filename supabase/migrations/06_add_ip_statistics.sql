/*
# Add IP Statistics Function

## New Functions
- `get_tests_by_ip()` - Get test statistics grouped by IP address

## Purpose
- Provide IP-based analytics for admin dashboard
- Show geographic distribution of tests
*/

-- Create function to get tests grouped by IP
CREATE OR REPLACE FUNCTION get_tests_by_ip()
RETURNS TABLE (
  ip_address text,
  count bigint,
  country text,
  city text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    ts.ip_address,
    COUNT(*)::bigint as count,
    ts.country,
    ts.city
  FROM test_submissions ts
  WHERE ts.ip_address IS NOT NULL
  GROUP BY ts.ip_address, ts.country, ts.city
  ORDER BY count DESC
  LIMIT 100;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_tests_by_ip() TO authenticated;

COMMENT ON FUNCTION get_tests_by_ip IS '获取按IP地址分组的测试统计';

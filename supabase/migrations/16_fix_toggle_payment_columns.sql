/*
# Fix toggle_payment_system Column Names

## Problem
The toggle_payment_system function uses wrong column names.
Table has: setting_key, setting_value
Function uses: key, value

## Solution
Update the function to use correct column names
*/

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
  INSERT INTO system_settings (setting_key, setting_value, updated_at)
  VALUES ('payment_enabled', to_jsonb(enabled), now())
  ON CONFLICT (setting_key) 
  DO UPDATE SET 
    setting_value = to_jsonb(enabled),
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

COMMENT ON FUNCTION toggle_payment_system IS 'Toggle payment system, uses flexible admin check with correct column names';

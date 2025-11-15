/*
# Fix Payment Toggle Function

## Problem
The toggle_payment_system function stores boolean directly in setting_value,
but the system expects a JSON object with a 'value' key.

## Solution
Update the function to store the boolean in the correct format:
{ "value": true } or { "value": false }
*/

-- Update toggle_payment_system to use correct JSON format
CREATE OR REPLACE FUNCTION toggle_payment_system(enabled boolean, user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Use provided user_id or fall back to auth.uid()
  v_user_id := COALESCE(user_id, auth.uid());
  
  -- Check if user is admin
  IF NOT is_admin_by_id(v_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can toggle payment system';
  END IF;

  -- Update or insert setting with correct JSON format
  INSERT INTO system_settings (setting_key, setting_value, updated_by, description)
  VALUES (
    'payment_enabled',
    jsonb_build_object('value', enabled),
    v_user_id,
    'Payment system enabled/disabled status'
  )
  ON CONFLICT (setting_key)
  DO UPDATE SET
    setting_value = jsonb_build_object('value', enabled),
    updated_by = v_user_id,
    updated_at = now();

  -- Log action
  PERFORM log_admin_action(
    'toggle_payment_system',
    'system_settings',
    NULL,
    jsonb_build_object('enabled', enabled),
    v_user_id
  );

  RETURN jsonb_build_object('success', true, 'enabled', enabled);
END;
$$;

COMMENT ON FUNCTION toggle_payment_system IS 'Toggle payment system with correct JSON format for setting_value';

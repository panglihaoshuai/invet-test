/*
# Fix Payment Toggle Function (renumbered)
*/
CREATE OR REPLACE FUNCTION toggle_payment_system(enabled boolean, user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := COALESCE(user_id, auth.uid());
  IF NOT is_admin_by_id(v_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can toggle payment system';
  END IF;

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

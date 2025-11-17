/*
# Fix Admin Functions for Custom Auth (renumbered)
*/
CREATE OR REPLACE FUNCTION is_admin_by_id(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

DROP FUNCTION IF EXISTS toggle_payment_system(boolean);

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
    to_jsonb(enabled),
    v_user_id,
    'Payment system enabled/disabled status'
  )
  ON CONFLICT (setting_key)
  DO UPDATE SET
    setting_value = to_jsonb(enabled),
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

CREATE OR REPLACE FUNCTION get_payment_system_status()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_enabled boolean;
BEGIN
  SELECT (setting_value->>'value')::boolean INTO v_enabled
  FROM system_settings
  WHERE setting_key = 'payment_enabled';
  RETURN COALESCE(v_enabled, true);
END;
$$;

CREATE OR REPLACE FUNCTION log_admin_action(
  p_action text,
  p_resource_type text,
  p_resource_id uuid,
  p_details jsonb,
  p_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  INSERT INTO admin_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    v_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  );
END;
$$;

GRANT EXECUTE ON FUNCTION is_admin_by_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_payment_system(boolean, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_system_status() TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_action(text, text, uuid, jsonb, uuid) TO authenticated;

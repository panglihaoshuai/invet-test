/*
# Ensure User Profiles Exist (renumbered)
*/
ALTER TABLE gift_codes ALTER COLUMN created_by DROP NOT NULL;
CREATE OR REPLACE FUNCTION ensure_profile_exists(
  p_user_id uuid,
  p_email text,
  p_role user_role DEFAULT 'user'::user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, role, created_at, updated_at)
  VALUES (p_user_id, p_email, p_role, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION is_admin_by_id(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'::user_role FROM profiles WHERE id = user_id),
    false
  );
$$;

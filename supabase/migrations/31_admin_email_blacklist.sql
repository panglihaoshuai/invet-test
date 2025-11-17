CREATE TABLE IF NOT EXISTS public.admin_emails (
  email text PRIMARY KEY,
  CONSTRAINT admin_emails_lower CHECK (email = LOWER(email))
);
CREATE TABLE IF NOT EXISTS public.blocked_emails (
  email text PRIMARY KEY,
  CONSTRAINT blocked_emails_lower CHECK (email = LOWER(email))
);
CREATE OR REPLACE FUNCTION public.add_admin_email(p_email text, p_actor_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor uuid;
  v_email text;
BEGIN
  v_actor := COALESCE(p_actor_id, auth.uid());
  IF NOT public.is_admin_by_id(v_actor) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  v_email := LOWER(p_email);
  INSERT INTO public.admin_emails(email) VALUES (v_email) ON CONFLICT (email) DO NOTHING;
  RETURN jsonb_build_object('success', true);
END;
$$;
CREATE OR REPLACE FUNCTION public.remove_admin_email(p_email text, p_actor_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor uuid;
  v_email text;
BEGIN
  v_actor := COALESCE(p_actor_id, auth.uid());
  IF NOT public.is_admin_by_id(v_actor) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  v_email := LOWER(p_email);
  DELETE FROM public.admin_emails WHERE email = v_email;
  RETURN jsonb_build_object('success', true);
END;
$$;
CREATE OR REPLACE FUNCTION public.add_blocked_email(p_email text, p_actor_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor uuid;
  v_email text;
BEGIN
  v_actor := COALESCE(p_actor_id, auth.uid());
  IF NOT public.is_admin_by_id(v_actor) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  v_email := LOWER(p_email);
  INSERT INTO public.blocked_emails(email) VALUES (v_email) ON CONFLICT (email) DO NOTHING;
  RETURN jsonb_build_object('success', true);
END;
$$;
CREATE OR REPLACE FUNCTION public.remove_blocked_email(p_email text, p_actor_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor uuid;
  v_email text;
BEGIN
  v_actor := COALESCE(p_actor_id, auth.uid());
  IF NOT public.is_admin_by_id(v_actor) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  v_email := LOWER(p_email);
  DELETE FROM public.blocked_emails WHERE email = v_email;
  RETURN jsonb_build_object('success', true);
END;
$$;
CREATE OR REPLACE FUNCTION public.is_email_blocked(p_email text)
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT EXISTS(SELECT 1 FROM public.blocked_emails WHERE email = LOWER(p_email));
$$;
CREATE OR REPLACE FUNCTION public.list_admin_emails()
RETURNS SETOF text
LANGUAGE sql
AS $$
  SELECT email FROM public.admin_emails ORDER BY email;
$$;
CREATE OR REPLACE FUNCTION public.list_blocked_emails()
RETURNS SETOF text
LANGUAGE sql
AS $$
  SELECT email FROM public.blocked_emails ORDER BY email;
$$;
CREATE OR REPLACE FUNCTION public.is_admin_by_email(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'::public.user_role FROM public.profiles WHERE LOWER(email) = LOWER(user_email)),
    EXISTS(SELECT 1 FROM public.system_config WHERE config_key = 'admin_email' AND LOWER(config_value) = LOWER(user_email)) OR
    EXISTS(SELECT 1 FROM public.admin_emails WHERE email = LOWER(user_email))
  );
$$;

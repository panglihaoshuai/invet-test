ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash text;
UPDATE public.users SET email = LOWER(email);
UPDATE public.profiles SET email = LOWER(email);
UPDATE public.system_config SET config_value = LOWER(config_value) WHERE config_key = 'admin_email';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ALTER COLUMN role TYPE public.user_role USING role::public.user_role;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;

ALTER TABLE public.system_settings DROP CONSTRAINT IF EXISTS system_settings_updated_by_fkey;
ALTER TABLE public.system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;
GRANT ALL ON public.system_settings TO service_role;
GRANT ALL ON public.system_settings TO anon;
GRANT ALL ON public.system_settings TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin_by_email(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'::public.user_role FROM public.profiles WHERE LOWER(email) = LOWER(user_email)),
    EXISTS(SELECT 1 FROM public.system_config WHERE config_key = 'admin_email' AND LOWER(config_value) = LOWER(user_email))
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_by_id(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM public.users WHERE id = user_id;
  IF user_email IS NULL THEN
    SELECT email INTO user_email FROM public.profiles WHERE id = user_id;
  END IF;
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  RETURN public.is_admin_by_email(user_email);
END;
$$;

INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT u.id, u.email, 'admin'::public.user_role, now(), now()
FROM public.users u
JOIN public.system_config c ON c.config_key = 'admin_email'
WHERE LOWER(u.email) = LOWER(c.config_value)
ON CONFLICT (id)
DO UPDATE SET email = EXCLUDED.email, role = 'admin'::public.user_role, updated_at = now();

DROP FUNCTION IF EXISTS public.toggle_payment_system(boolean, uuid);
CREATE FUNCTION public.toggle_payment_system(
  enabled boolean,
  user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := COALESCE(user_id, auth.uid());
  IF NOT public.is_admin_by_id(v_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can toggle payment system';
  END IF;

  INSERT INTO public.system_settings (setting_key, setting_value, updated_by, description)
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

  RETURN jsonb_build_object('success', true, 'enabled', enabled);
END;
$$;

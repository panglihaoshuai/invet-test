/*
# Recreate Users table (renumbered)
*/
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.users OWNER TO postgres;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.users TO postgres;
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
COMMENT ON TABLE public.users IS '用户表 - 存储用户基本信息';
COMMENT ON COLUMN public.users.id IS '用户唯一标识';
COMMENT ON COLUMN public.users.email IS '用户邮箱地址';
COMMENT ON COLUMN public.users.created_at IS '创建时间';
COMMENT ON COLUMN public.users.updated_at IS '更新时间';
NOTIFY pgrst, 'reload schema';

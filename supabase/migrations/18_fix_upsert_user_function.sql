/*
# 修复 upsert_user 函数

## 问题
列名 "email" 存在歧义，可能指代 PL/pgSQL 变量或表列。

## 解决方案
使用表别名明确指定列引用。
*/

-- 删除旧函数
DROP FUNCTION IF EXISTS public.upsert_user(text);

-- 重新创建函数，修复列名歧义问题
CREATE OR REPLACE FUNCTION public.upsert_user(user_email text)
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 尝试插入新用户，如果邮箱已存在则返回现有用户
  RETURN QUERY
  INSERT INTO public.users (email)
  VALUES (user_email)
  ON CONFLICT (email) 
  DO UPDATE SET updated_at = now()
  RETURNING 
    public.users.id,
    public.users.email,
    public.users.created_at,
    public.users.updated_at;
END;
$$;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO service_role;

-- 添加注释
COMMENT ON FUNCTION public.upsert_user(text) IS '创建或获取用户 - 如果邮箱已存在则返回现有用户，否则创建新用户';

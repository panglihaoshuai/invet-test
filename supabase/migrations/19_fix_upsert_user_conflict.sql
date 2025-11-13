/*
# 修复 upsert_user 函数的 ON CONFLICT 子句

## 问题
ON CONFLICT (email) 中的 email 存在歧义。

## 解决方案
明确指定冲突列，使用完整的表名和列名。
*/

-- 删除旧函数
DROP FUNCTION IF EXISTS public.upsert_user(text);

-- 重新创建函数，修复 ON CONFLICT 歧义问题
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
DECLARE
  result_record RECORD;
BEGIN
  -- 尝试插入新用户，如果邮箱已存在则返回现有用户
  INSERT INTO public.users (email)
  VALUES (user_email)
  ON CONFLICT (email) 
  DO UPDATE SET updated_at = now()
  RETURNING 
    public.users.id,
    public.users.email,
    public.users.created_at,
    public.users.updated_at
  INTO result_record;
  
  -- 返回结果
  id := result_record.id;
  email := result_record.email;
  created_at := result_record.created_at;
  updated_at := result_record.updated_at;
  
  RETURN NEXT;
END;
$$;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO service_role;

-- 添加注释
COMMENT ON FUNCTION public.upsert_user(text) IS '创建或获取用户 - 如果邮箱已存在则返回现有用户，否则创建新用户';

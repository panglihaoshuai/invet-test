/*
# 创建 upsert_user RPC 函数

## 目的
提供一个 RPC 函数来创建或获取用户，绕过 PostgREST 表缓存问题。

## 优势
1. RPC 函数不受表缓存影响
2. 可以立即使用，无需等待缓存更新
3. 提供原子性的 upsert 操作

## 使用方法
前端调用：
```javascript
const { data, error } = await supabase.rpc('upsert_user', {
  user_email: 'user@example.com'
});
```
*/

-- 创建 upsert_user 函数
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
    users.id,
    users.email,
    users.created_at,
    users.updated_at;
END;
$$;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO service_role;

-- 添加注释
COMMENT ON FUNCTION public.upsert_user(text) IS '创建或获取用户 - 如果邮箱已存在则返回现有用户，否则创建新用户';

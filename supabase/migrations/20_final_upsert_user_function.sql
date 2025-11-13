/*
# 最终版本的 upsert_user 函数

## 问题
RETURNS TABLE 中的列名与表的列名冲突，导致歧义。

## 解决方案
使用 RETURNS SETOF 返回类型，避免列名冲突。
*/

-- 删除旧函数
DROP FUNCTION IF EXISTS public.upsert_user(text);

-- 创建最终版本的函数
CREATE OR REPLACE FUNCTION public.upsert_user(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user json;
BEGIN
  -- 尝试插入新用户，如果邮箱已存在则更新时间戳
  WITH upserted AS (
    INSERT INTO public.users (email)
    VALUES (p_email)
    ON CONFLICT (email) 
    DO UPDATE SET updated_at = now()
    RETURNING id, email, created_at, updated_at
  )
  SELECT row_to_json(upserted.*) INTO v_user FROM upserted;
  
  RETURN v_user;
END;
$$;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user(text) TO service_role;

-- 添加注释
COMMENT ON FUNCTION public.upsert_user(text) IS '创建或获取用户 - 如果邮箱已存在则返回现有用户，否则创建新用户。返回 JSON 格式的用户对象。';

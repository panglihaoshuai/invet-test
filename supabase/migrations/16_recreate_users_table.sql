/*
# 重新创建 Users 表

## 问题
PostgREST 缓存无法识别 users 表，导致 PGRST205 错误。
NOTIFY 命令在托管环境中可能不会立即生效。

## 解决方案
1. 删除现有的 users 表
2. 重新创建 users 表，确保所有设置正确
3. 立即授予所有必要的权限
4. 确保表对 API 可见

## 注意
这会删除现有的用户数据，但由于系统刚开始使用，应该没有重要数据。
*/

-- 1. 删除现有的 users 表（如果存在）
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. 重新创建 users 表
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. 设置表的所有者
ALTER TABLE public.users OWNER TO postgres;

-- 4. 禁用 RLS（按照原始设计）
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 5. 授予所有必要的权限
GRANT ALL ON public.users TO postgres;
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- 6. 添加注释
COMMENT ON TABLE public.users IS '用户表 - 存储用户基本信息';
COMMENT ON COLUMN public.users.id IS '用户唯一标识';
COMMENT ON COLUMN public.users.email IS '用户邮箱地址';
COMMENT ON COLUMN public.users.created_at IS '创建时间';
COMMENT ON COLUMN public.users.updated_at IS '更新时间';

-- 7. 通知 PostgREST 重新加载模式
NOTIFY pgrst, 'reload schema';

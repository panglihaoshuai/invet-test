# 快速设置管理员账号

## 方法一：通过邮箱设置（推荐）

### 步骤1：登录系统
使用您想要设置为管理员的邮箱登录系统（例如：admin@test.com）

### 步骤2：执行SQL命令

在 Supabase 控制台的 SQL Editor 中执行以下命令：

```sql
-- 替换 'your-email@example.com' 为您的实际邮箱地址
DO $$
DECLARE
  admin_email_value text := 'your-email@example.com';  -- 👈 修改这里
BEGIN
  -- 更新系统配置
  UPDATE system_config 
  SET config_value = admin_email_value 
  WHERE config_key = 'admin_email';
  
  -- 更新用户角色
  UPDATE profiles 
  SET role = 'admin'::user_role 
  WHERE email = admin_email_value;
  
  RAISE NOTICE '管理员设置成功！邮箱: %', admin_email_value;
END $$;
```

### 步骤3：刷新页面
刷新浏览器页面，您现在应该可以看到右上角的"管理后台"按钮。

---

## 方法二：直接设置当前用户为管理员

如果您已经登录，可以通过用户ID直接设置：

```sql
-- 查看所有用户
SELECT id, email, role FROM profiles;

-- 将特定用户设置为管理员（替换 user_id）
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE id = 'user-uuid-here';  -- 👈 替换为实际的用户ID
```

---

## 验证管理员权限

执行以下查询确认设置成功：

```sql
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles
WHERE role = 'admin';
```

应该能看到您的账号，且 role 字段显示为 'admin'。

---

## 访问管理后台

设置成功后：
1. 刷新页面
2. 点击右上角的"管理后台"按钮
3. 您将看到以下管理功能：
   - 📊 概览：系统统计数据
   - 👥 用户管理：查看和管理用户
   - 📦 订单管理：查看所有订单
   - 🎁 礼品码管理：生成和管理礼品码
   - ⚙️ 系统设置：修改系统配置

---

## 常见问题

### Q: 执行SQL后仍然看不到管理后台？
A: 请尝试：
1. 完全刷新页面（Ctrl+F5 或 Cmd+Shift+R）
2. 清除浏览器缓存
3. 退出登录后重新登录

### Q: 如何添加多个管理员？
A: 可以直接更新多个用户的角色：
```sql
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email IN ('admin1@test.com', 'admin2@test.com');
```

### Q: 如何取消管理员权限？
A: 将角色改回普通用户：
```sql
UPDATE profiles 
SET role = 'user'::user_role 
WHERE email = 'user@test.com';
```

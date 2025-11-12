# 管理员邮箱自动配置指南

## 概述

本系统支持自动管理员分配功能。当指定的邮箱地址注册时，系统会自动将该用户设置为管理员角色，并在登录后直接跳转到管理后台。

## 配置步骤

### 1. 设置管理员邮箱

在项目根目录的 `.env` 文件中，找到以下配置项：

```env
# Admin Configuration
# Set your admin email here - this email will automatically become admin upon registration
VITE_ADMIN_EMAIL=your-admin-email@example.com
```

将 `your-admin-email@example.com` 替换为您的实际邮箱地址。

**示例：**
```env
VITE_ADMIN_EMAIL=admin@company.com
```

### 2. 更新数据库配置

系统会自动从 `.env` 文件读取管理员邮箱，但您也可以通过数据库直接更新：

```sql
UPDATE system_config 
SET config_value = 'your-admin-email@example.com'
WHERE config_key = 'admin_email';
```

### 3. 注册管理员账号

1. 访问登录页面
2. 使用配置的管理员邮箱进行注册
3. 输入收到的验证码
4. 系统会自动识别该邮箱为管理员邮箱
5. 登录成功后自动跳转到管理后台 `/admin`

## 工作原理

### 数据库触发器

系统使用数据库触发器 `handle_new_user()` 在用户注册时自动检查邮箱：

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email text;
BEGIN
  -- 从配置表获取管理员邮箱
  SELECT config_value INTO admin_email
  FROM system_config
  WHERE config_key = 'admin_email';

  -- 如果新用户邮箱匹配管理员邮箱，自动设置为管理员
  IF NEW.email = admin_email THEN
    NEW.role := 'admin'::user_role;
  END IF;

  RETURN NEW;
END;
$$;
```

### 登录流程

1. 用户输入邮箱和验证码
2. 验证成功后创建或获取用户信息
3. 系统检查用户角色
4. 如果是管理员，跳转到 `/admin`
5. 如果是普通用户，跳转到 `/`

## 安全建议

### 1. 保护 .env 文件

确保 `.env` 文件不会被提交到版本控制系统：

```gitignore
# .gitignore
.env
.env.local
.env.production
```

### 2. 使用强验证码

系统使用 6 位数字验证码，有效期 5 分钟。建议：
- 在生产环境中使用真实的邮件发送服务
- 考虑添加验证码尝试次数限制
- 实施 IP 限流防止暴力破解

### 3. 定期审计

管理员的所有操作都会记录在 `admin_logs` 表中：

```sql
SELECT * FROM admin_logs 
WHERE user_id = 'admin-user-id'
ORDER BY created_at DESC;
```

### 4. 多管理员支持

如果需要多个管理员，可以：

1. **方法一：手动设置**（推荐）
   - 第一个管理员登录后台
   - 在用户管理中将其他用户提升为管理员

2. **方法二：数据库直接更新**
   ```sql
   UPDATE profiles 
   SET role = 'admin'::user_role 
   WHERE email = 'another-admin@example.com';
   ```

## 常见问题

### Q: 如何更改管理员邮箱？

**A:** 有两种方法：

1. **通过 .env 文件**（推荐）
   - 修改 `.env` 中的 `VITE_ADMIN_EMAIL`
   - 重启应用

2. **通过数据库**
   ```sql
   UPDATE system_config 
   SET config_value = 'new-admin@example.com',
       updated_at = now()
   WHERE config_key = 'admin_email';
   ```

### Q: 已注册的用户能否成为管理员？

**A:** 可以。有两种方式：

1. 由现有管理员在后台提升权限
2. 直接修改数据库：
   ```sql
   UPDATE profiles 
   SET role = 'admin'::user_role 
   WHERE email = 'user@example.com';
   ```

### Q: 管理员可以降级为普通用户吗？

**A:** 可以，但需要确保至少保留一个管理员账号：

```sql
UPDATE profiles 
SET role = 'user'::user_role 
WHERE email = 'admin@example.com';
```

### Q: 如何查看当前的管理员邮箱配置？

**A:** 查询数据库：

```sql
SELECT config_value 
FROM system_config 
WHERE config_key = 'admin_email';
```

## 管理员权限

管理员拥有以下权限：

### 数据查看
- ✅ 查看所有用户信息
- ✅ 查看所有测试提交记录
- ✅ 查看系统统计数据
- ✅ 查看操作日志

### 系统控制
- ✅ 开启/关闭支付系统
- ✅ 管理用户角色
- ✅ 查看 IP 统计信息
- ✅ 导出数据报表

### 安全功能
- ✅ 所有操作自动记录日志
- ✅ 支持审计追踪
- ✅ 权限隔离（普通用户无法访问管理功能）

## 测试管理员功能

### 1. 本地测试

```bash
# 1. 设置测试管理员邮箱
echo "VITE_ADMIN_EMAIL=test-admin@example.com" >> .env

# 2. 启动应用
npm run dev

# 3. 访问登录页面并使用 test-admin@example.com 注册
```

### 2. 验证管理员权限

登录后检查：
- [ ] 是否自动跳转到 `/admin`
- [ ] 能否看到管理后台界面
- [ ] 能否查看统计数据
- [ ] 能否管理用户角色

## 技术支持

如有问题，请检查：

1. **数据库连接**
   ```bash
   # 检查 Supabase 连接
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

2. **触发器状态**
   ```sql
   SELECT * FROM pg_trigger 
   WHERE tgname = 'on_profile_created';
   ```

3. **配置表数据**
   ```sql
   SELECT * FROM system_config 
   WHERE config_key = 'admin_email';
   ```

4. **用户角色**
   ```sql
   SELECT id, email, role, created_at 
   FROM profiles 
   ORDER BY created_at DESC;
   ```

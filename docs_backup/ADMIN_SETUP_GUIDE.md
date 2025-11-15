# 管理员设置指南

## 🎯 角色说明

系统只有 **2 个角色**，非常简单：

| 角色 | 说明 | 权限 |
|------|------|------|
| **user** | 普通用户（默认） | 只能查看自己的数据 |
| **admin** | 管理员 | 可以查看所有数据、访问后台、管理系统设置 |

## 🔧 创建第一个管理员

### 方法 1：直接在数据库中设置（推荐）

1. **登录 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择你的项目

2. **打开 SQL Editor**
   - 左侧菜单 → SQL Editor
   - 点击 "New query"

3. **执行以下 SQL**
   ```sql
   -- 将指定邮箱的用户设置为管理员
   UPDATE profiles 
   SET role = 'admin'::user_role 
   WHERE email = 'your-email@example.com';
   ```

4. **验证**
   ```sql
   -- 查看所有管理员
   SELECT id, email, role, created_at 
   FROM profiles 
   WHERE role = 'admin';
   ```

### 方法 2：通过 Supabase Table Editor

1. **打开 Table Editor**
   - 左侧菜单 → Table Editor
   - 选择 `profiles` 表

2. **找到你的用户**
   - 搜索你的邮箱

3. **编辑角色**
   - 点击 `role` 列
   - 从下拉菜单选择 `admin`
   - 保存

## 👥 添加更多管理员

### 方法 1：通过管理员后台（推荐）

一旦你有了第一个管理员账号：

1. **登录系统**
   - 使用管理员邮箱登录

2. **访问管理员后台**
   - 导航到 `/admin` 页面

3. **用户管理**
   - 查看所有用户列表
   - 点击用户旁边的"设为管理员"按钮

### 方法 2：使用 SQL

```sql
-- 批量设置多个管理员
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
);
```

## 🔍 检查当前用户是否为管理员

### 在代码中检查

```typescript
import { adminApi } from '@/db/adminApi';

// 检查当前用户是否为管理员
const isAdmin = await adminApi.isAdmin();

if (isAdmin) {
  console.log('当前用户是管理员');
} else {
  console.log('当前用户是普通用户');
}
```

### 在数据库中检查

```sql
-- 检查特定用户
SELECT is_admin('user-uuid-here');

-- 查看所有管理员
SELECT * FROM profiles WHERE role = 'admin';
```

## 🛡️ 权限说明

### 管理员可以做什么

✅ 查看所有用户的测试记录  
✅ 查看所有支付订单  
✅ 查看系统统计数据  
✅ 查看用户 IP 地址和地理位置  
✅ 开启/关闭支付系统  
✅ 查看管理员操作日志  
✅ 提升其他用户为管理员  
✅ 查看所有用户的 DeepSeek 分析  

### 普通用户可以做什么

✅ 查看自己的测试记录  
✅ 查看自己的支付订单  
✅ 购买 DeepSeek 分析  
✅ 查看自己购买的分析报告  
❌ 不能访问管理员后台  
❌ 不能查看其他用户的数据  

## 🔒 安全建议

1. **最小权限原则**
   - 只给必要的人管理员权限
   - 定期审查管理员列表

2. **审计日志**
   - 所有管理员操作都会被记录
   - 定期检查审计日志

3. **账号安全**
   - 管理员账号使用强密码
   - 考虑启用多因素认证（未来功能）

4. **定期审查**
   - 每月审查管理员列表
   - 移除不再需要的管理员权限

## 📊 管理员后台功能

### 1. 统计面板
- 测试总数和今日测试数
- 独立用户数量
- 支付订单数量和总金额
- 今日支付数量

### 2. 用户分析
- 用户 IP 地址分布
- 地理位置统计
- 测试完成率

### 3. 系统控制
- 支付系统开关
- 系统设置管理

### 4. 审计日志
- 管理员操作记录
- 操作时间和详情
- IP 地址追踪

## 🚀 快速开始

### 第一次设置

1. **注册一个账号**
   ```
   访问系统 → 登录页面 → 输入邮箱 → 获取验证码 → 登录
   ```

2. **设置为管理员**
   ```sql
   -- 在 Supabase SQL Editor 中执行
   UPDATE profiles 
   SET role = 'admin'::user_role 
   WHERE email = 'your-email@example.com';
   ```

3. **访问管理员后台**
   ```
   重新登录 → 导航到 /admin → 查看统计数据
   ```

4. **添加更多管理员**
   ```
   管理员后台 → 用户管理 → 选择用户 → 设为管理员
   ```

## ❓ 常见问题

### Q: 如何取消管理员权限？

A: 两种方法：

**方法 1：通过 SQL**
```sql
UPDATE profiles 
SET role = 'user'::user_role 
WHERE email = 'user@example.com';
```

**方法 2：通过管理员后台**
- 用户管理 → 选择用户 → 设为普通用户

### Q: 管理员可以删除用户吗？

A: 当前版本不支持删除用户。如需删除，请在 Supabase Dashboard 中手动操作。

### Q: 管理员操作会被记录吗？

A: 是的，所有管理员操作都会记录在 `admin_logs` 表中，包括：
- 操作类型
- 操作时间
- 操作详情
- IP 地址

### Q: 如何查看管理员日志？

A: 在管理员后台的"审计日志"页面，或使用 SQL：
```sql
SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 100;
```

### Q: 普通用户能看到管理员后台吗？

A: 不能。系统会自动检查用户角色，普通用户访问 `/admin` 会被重定向到首页。

### Q: 可以有多个管理员吗？

A: 可以！系统支持任意数量的管理员。

## 📝 示例场景

### 场景 1：公司内部使用

```
CEO: admin
CTO: admin
产品经理: admin
其他员工: user
```

### 场景 2：个人项目

```
你自己: admin
测试账号: user
```

### 场景 3：团队协作

```
创始人: admin
运营负责人: admin
客服: user（只能查看自己处理的订单）
```

## 🔄 角色切换流程

```
新用户注册
    ↓
自动创建 profile (role = 'user')
    ↓
管理员在后台提升为 admin
    ↓
用户重新登录后获得管理员权限
    ↓
可以访问管理员后台
```

## 📞 技术支持

如果遇到问题：

1. **检查 profiles 表**
   ```sql
   SELECT * FROM profiles WHERE email = 'your-email@example.com';
   ```

2. **检查 RLS 策略**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **查看错误日志**
   - Supabase Dashboard → Logs → 查看错误

---

**文档版本**：1.0.0  
**最后更新**：2025-11-10  
**适用系统版本**：v2.0.0+

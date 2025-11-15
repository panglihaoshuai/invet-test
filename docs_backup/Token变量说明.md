# 📧 {{ .Token }} 变量说明

## ✅ 重要说明

**{{ .Token }} 变量不需要任何配置！**

这是 Supabase 的**内置变量**，会自动工作。

---

## 🔍 什么是 {{ .Token }}？

### 定义

`{{ .Token }}` 是 Supabase 邮件模板中的一个**占位符变量**，用于显示自动生成的验证码。

### 工作原理

```
1. 用户点击"发送验证码"
   ↓
2. 应用调用 supabase.auth.signInWithOtp({ email: "..." })
   ↓
3. Supabase 自动生成 6位数字验证码（例如：123456）
   ↓
4. Supabase 使用邮件模板发送邮件
   ↓
5. 邮件模板中的 {{ .Token }} 被替换为实际的验证码
   ↓
6. 用户收到包含验证码的邮件
```

---

## 📝 使用方法

### 在邮件模板中使用

只需要在邮件模板中写入 `{{ .Token }}`，Supabase 会自动替换：

```html
<h2>您的验证码</h2>
<p>验证码是：</p>
<h1>{{ .Token }}</h1>
```

### 实际效果

用户收到的邮件会显示：

```
您的验证码

验证码是：

123456
```

---

## ⚙️ 无需配置

### ✅ 自动生成

- Supabase 会自动生成 6位数字验证码
- 不需要在代码中配置
- 不需要在 Supabase Dashboard 中设置
- 不需要设置环境变量

### ✅ 自动替换

- 发送邮件时，Supabase 会自动将 `{{ .Token }}` 替换为实际验证码
- 不需要手动处理
- 不需要编写额外代码

### ✅ 自动验证

- 用户输入验证码后，Supabase 会自动验证
- 验证逻辑已经在 `LoginPage.tsx` 中实现
- 不需要额外配置

---

## 🔑 验证码特性

### 自动生成的验证码

| 特性 | 说明 |
|------|------|
| **格式** | 6位数字 |
| **示例** | 123456, 789012, 456789 |
| **有效期** | 5分钟（300秒） |
| **唯一性** | 每次请求生成新的验证码 |
| **安全性** | 随机生成，不可预测 |

### 验证码行为

- ✅ 每次发送验证码都会生成新的
- ✅ 旧的验证码会自动失效
- ✅ 5分钟后自动过期
- ✅ 验证成功后立即失效
- ✅ 只能使用一次

---

## 🆚 变量对比

### {{ .Token }} vs {{ .ConfirmationURL }}

| 特性 | {{ .Token }} | {{ .ConfirmationURL }} |
|------|--------------|------------------------|
| **类型** | 数字验证码 | 魔法链接 |
| **格式** | 6位数字 | 完整的 URL |
| **使用方式** | 用户手动输入 | 用户点击链接 |
| **示例** | 123456 | https://xxx.supabase.co/auth/v1/verify?token=... |
| **适用场景** | OTP 登录 | 魔法链接登录 |
| **模板** | Confirm signup | Magic Link |

### 我们使用的是 {{ .Token }}

因为我们的应用使用的是 **OTP（一次性密码）登录方式**：

```typescript
// LoginPage.tsx 中的代码
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: true,
    emailRedirectTo: undefined, // 不使用魔法链接
  }
});
```

这个方法会：
1. 生成 6位数字验证码
2. 发送包含 `{{ .Token }}` 的邮件
3. 用户输入验证码后验证登录

---

## 📋 完整流程

### 1. 发送验证码

**前端代码**（已实现）：
```typescript
// src/pages/LoginPage.tsx
const handleSendCode = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
  });
};
```

**Supabase 自动处理**：
- ✅ 生成 6位数字验证码
- ✅ 将验证码存储在数据库中
- ✅ 使用邮件模板发送邮件
- ✅ 将 `{{ .Token }}` 替换为实际验证码

### 2. 用户收到邮件

**邮件内容**：
```
确认您的邮箱

您好！

感谢您使用人格特质投资策略评估系统。

您的验证码是：

123456  ← 这是 {{ .Token }} 被替换后的结果

此验证码将在 5分钟 后过期。
```

### 3. 验证登录

**前端代码**（已实现）：
```typescript
// src/pages/LoginPage.tsx
const handleVerifyCode = async () => {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email,
    token: code, // 用户输入的验证码
    type: 'email',
  });
};
```

**Supabase 自动处理**：
- ✅ 验证验证码是否正确
- ✅ 检查验证码是否过期
- ✅ 验证成功后创建用户会话
- ✅ 返回用户信息和访问令牌

---

## ✅ 配置检查清单

### 代码配置（已完成）

- [x] LoginPage.tsx 使用 `signInWithOtp` 方法
- [x] LoginPage.tsx 使用 `verifyOtp` 方法验证
- [x] 验证码输入框（6位数字）
- [x] 倒计时功能（60秒）
- [x] 错误处理和提示

### Supabase 配置（需要您操作）

- [ ] 修改 "Confirm signup" 邮件模板
- [ ] 模板中包含 `{{ .Token }}`
- [ ] 保存模板
- [ ] 测试发送验证码

### 环境变量（已配置）

- [x] VITE_SUPABASE_URL
- [x] VITE_SUPABASE_ANON_KEY
- [x] VITE_ADMIN_EMAIL

---

## 🎯 关键要点

### 1. {{ .Token }} 是自动的

- ✅ 不需要配置
- ✅ 不需要设置
- ✅ 不需要编写代码
- ✅ 只需要在邮件模板中使用

### 2. 只需要做一件事

**在 Supabase 邮件模板中使用 `{{ .Token }}`**

```html
<!-- 正确的用法 -->
<h1>{{ .Token }}</h1>

<!-- 错误的用法 -->
<h1>{{ .ConfirmationURL }}</h1>  ← 这会生成链接，不是验证码
```

### 3. 其他都是自动的

- ✅ 验证码生成 - Supabase 自动
- ✅ 验证码发送 - Supabase 自动
- ✅ 验证码验证 - Supabase 自动
- ✅ 验证码过期 - Supabase 自动

---

## 🔧 故障排查

### 问题：收到的邮件没有验证码

**可能原因**：
1. 邮件模板中没有 `{{ .Token }}`
2. 使用了错误的变量（如 `{{ .ConfirmationURL }}`）
3. 修改了错误的模板（修改了 "Magic Link" 而不是 "Confirm signup"）

**解决方案**：
1. 确认修改的是 "Confirm signup" 模板
2. 确认模板中包含 `{{ .Token }}`
3. 保存模板并等待 2-3 分钟
4. 重新测试

### 问题：验证码显示为 {{ .Token }}

**可能原因**：
1. 邮件客户端不支持 HTML
2. 模板语法错误

**解决方案**：
1. 检查邮件模板语法
2. 确认使用的是 `{{ .Token }}` 而不是 `{ .Token }` 或 `{{{ .Token }}}`
3. 使用其他邮件客户端测试

### 问题：验证码不是6位数字

**可能原因**：
1. 使用了错误的认证方法
2. Supabase 配置问题

**解决方案**：
1. 确认代码中使用的是 `signInWithOtp`
2. 检查 Supabase Dashboard → Auth Logs
3. 确认 Email OTP 已启用

---

## 📚 相关文档

- **必读-邮件模板配置.txt** - 邮件模板配置步骤
- **故障排查-验证码邮件.md** - 完整故障排查指南
- **重要-邮件模板配置说明.md** - 详细配置说明

---

## 💡 总结

### 最重要的三点

1. **{{ .Token }} 不需要配置**
   - 这是 Supabase 的内置变量
   - 会自动生成和替换

2. **只需要在邮件模板中使用**
   - 在 "Confirm signup" 模板中写入 `{{ .Token }}`
   - Supabase 会自动处理其他所有事情

3. **代码已经正确实现**
   - LoginPage.tsx 已经使用了正确的方法
   - 不需要修改任何代码
   - 只需要配置邮件模板

---

**配置时间**: 0分钟（不需要配置）  
**使用时间**: 1分钟（在邮件模板中添加）  
**重要性**: ⭐⭐⭐⭐⭐（必须正确使用）

**{{ .Token }} 是自动的，您只需要在邮件模板中使用它！** 🎯

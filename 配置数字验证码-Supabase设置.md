# 🔧 配置数字验证码 - Supabase 设置指南

## 📋 问题说明

**当前问题**: 邮件中收到的是魔法链接（Magic Link），而不是6位数字验证码。

**原因**: Supabase Auth 默认发送魔法链接，需要修改邮件模板才能发送数字验证码。

---

## 🎯 解决方案

需要在 Supabase Dashboard 中修改邮件模板，将魔法链接改为显示数字验证码。

---

## 📝 配置步骤（5分钟）

### 步骤1: 登录 Supabase Dashboard

1. 访问：https://supabase.com/dashboard
2. 登录您的账号
3. 选择项目：`zrfnnerdaijcmhlemqld`

或直接访问：
```
https://supabase.com/dashboard/project/zrfnnerdaijcmhlemqld
```

---

### 步骤2: 进入邮件模板设置

1. 点击左侧菜单的 **Authentication**（认证）
2. 点击 **Email Templates**（邮件模板）

或直接访问：
```
https://supabase.com/dashboard/project/zrfnnerdaijcmhlemqld/auth/templates
```

---

### 步骤3: 修改 "Confirm signup" 模板

1. 在邮件模板列表中找到 **"Confirm signup"**
2. 点击进入编辑页面

---

### 步骤4: 替换邮件模板内容

**将默认模板替换为以下内容**：

```html
<h2>确认您的邮箱</h2>

<p>您好！</p>

<p>感谢您使用人格特质投资策略评估系统。</p>

<p>您的验证码是：</p>

<h1 style="font-size: 32px; font-weight: bold; color: #1DB954; letter-spacing: 5px; margin: 20px 0;">{{ .Token }}</h1>

<p>此验证码将在 <strong>5分钟</strong> 后过期。</p>

<p>如果您没有请求此验证码，请忽略此邮件。</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">

<p style="color: #666; font-size: 12px;">
  这是一封自动发送的邮件，请勿回复。<br>
  人格特质投资策略评估系统
</p>
```

---

### 步骤5: 保存模板

1. 点击页面底部的 **"Save"**（保存）按钮
2. 等待保存成功提示

---

## 📧 邮件模板说明

### 关键变量

- `{{ .Token }}` - 6位数字验证码
- `{{ .SiteURL }}` - 网站 URL（不需要使用）
- `{{ .ConfirmationURL }}` - 确认链接（不需要使用）

### 模板特点

- ✅ 显示6位数字验证码
- ✅ 突出显示验证码（大号字体、绿色）
- ✅ 提示5分钟有效期
- ✅ 简洁清晰的中文说明
- ✅ 专业的邮件格式

---

## 🎨 自定义邮件模板（可选）

如果您想进一步自定义邮件样式，可以修改以下部分：

### 1. 修改颜色
```html
<!-- 将绿色 #1DB954 改为您喜欢的颜色 -->
<h1 style="color: #1DB954;">{{ .Token }}</h1>
```

### 2. 修改字体大小
```html
<!-- 调整验证码字体大小 -->
<h1 style="font-size: 32px;">{{ .Token }}</h1>
```

### 3. 添加 Logo
```html
<!-- 在邮件顶部添加 Logo -->
<img src="您的Logo URL" alt="Logo" style="width: 150px; margin-bottom: 20px;">
```

### 4. 修改文案
```html
<!-- 自定义欢迎语和说明文字 -->
<p>您好！欢迎使用我们的系统。</p>
```

---

## 🔄 完整邮件模板（推荐）

这是一个更完整、更美观的邮件模板：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>邮箱验证</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #1DB954; font-size: 28px; font-weight: bold;">
                人格特质投资策略评估系统
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">确认您的邮箱</h2>
              
              <p style="margin: 0 0 20px 0; color: #666; font-size: 16px; line-height: 1.6;">
                您好！
              </p>
              
              <p style="margin: 0 0 20px 0; color: #666; font-size: 16px; line-height: 1.6;">
                感谢您使用人格特质投资策略评估系统。请使用以下验证码完成登录：
              </p>
              
              <!-- Verification Code -->
              <div style="background-color: #f8f9fa; border: 2px dashed #1DB954; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">您的验证码</p>
                <h1 style="margin: 0; font-size: 48px; font-weight: bold; color: #1DB954; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  {{ .Token }}
                </h1>
              </div>
              
              <p style="margin: 20px 0; color: #666; font-size: 14px; line-height: 1.6;">
                ⏰ 此验证码将在 <strong style="color: #1DB954;">5分钟</strong> 后过期。
              </p>
              
              <p style="margin: 20px 0; color: #666; font-size: 14px; line-height: 1.6;">
                🔒 如果您没有请求此验证码，请忽略此邮件。您的账户仍然是安全的。
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6; text-align: center;">
                这是一封自动发送的邮件，请勿回复。<br>
                © 2025 人格特质投资策略评估系统 - 版权所有
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## ✅ 验证配置

### 测试步骤

1. 保存邮件模板后，返回应用
2. 访问登录页面
3. 输入邮箱地址
4. 点击"发送验证码"
5. 检查邮箱

### 预期结果

您应该收到一封包含以下内容的邮件：

```
确认您的邮箱

您好！

感谢您使用人格特质投资策略评估系统。

您的验证码是：

123456

此验证码将在 5分钟 后过期。

如果您没有请求此验证码，请忽略此邮件。
```

---

## 🐛 常见问题

### Q1: 修改模板后还是收到魔法链接？

**解决方案**:
1. 确认已点击"Save"按钮保存模板
2. 清除浏览器缓存
3. 等待1-2分钟让配置生效
4. 重新发送验证码测试

### Q2: 邮件中没有显示验证码？

**解决方案**:
1. 确认模板中包含 `{{ .Token }}` 变量
2. 检查模板语法是否正确
3. 确认使用的是 "Confirm signup" 模板
4. 重新保存模板

### Q3: 邮件格式显示不正常？

**解决方案**:
1. 检查 HTML 标签是否闭合
2. 确认 CSS 样式语法正确
3. 使用简化版模板测试
4. 查看邮件客户端是否支持 HTML

### Q4: 验证码不是6位数字？

**解决方案**:
1. 确认 Supabase 项目配置正确
2. 检查是否启用了 Email OTP
3. 确认使用的是 `signInWithOtp` 方法
4. 查看 Supabase Dashboard → Auth Logs

---

## 📊 配置检查清单

### Supabase 配置
- [ ] 登录 Supabase Dashboard
- [ ] 进入 Email Templates 设置
- [ ] 找到 "Confirm signup" 模板
- [ ] 替换为新的邮件模板
- [ ] 保存模板
- [ ] 测试发送验证码
- [ ] 确认收到数字验证码

### 应用配置
- [x] LoginPage.tsx 已更新
- [x] 使用 signInWithOtp 方法
- [x] 验证码输入框（6位数字）
- [x] 验证码验证逻辑

---

## 🎯 下一步

1. **立即配置邮件模板**
   - 访问 Supabase Dashboard
   - 修改 "Confirm signup" 模板
   - 保存配置

2. **测试验证码登录**
   - 发送验证码
   - 检查邮件
   - 确认收到6位数字验证码
   - 完成登录

3. **自定义邮件样式**（可选）
   - 添加 Logo
   - 修改颜色
   - 调整文案
   - 优化布局

---

## 📚 相关文档

- **Supabase配置完成.md** - Supabase 配置说明
- **访问应用说明.md** - 应用访问指南
- **快速测试-登录验证.md** - 登录测试指南

---

## 🔗 快速链接

### Supabase Dashboard
```
项目主页:
https://supabase.com/dashboard/project/zrfnnerdaijcmhlemqld

邮件模板设置:
https://supabase.com/dashboard/project/zrfnnerdaijcmhlemqld/auth/templates

认证日志:
https://supabase.com/dashboard/project/zrfnnerdaijcmhlemqld/logs/auth-logs
```

---

## ✅ 配置完成后

配置完成后，您将能够：

- ✅ 收到包含6位数字验证码的邮件
- ✅ 使用验证码完成登录
- ✅ 享受流畅的登录体验
- ✅ 自定义邮件样式和内容

---

**配置时间**: 约5分钟  
**难度**: ⭐⭐☆☆☆（简单）  
**重要性**: ⭐⭐⭐⭐⭐（必须）

**立即配置，开始使用！** 🚀

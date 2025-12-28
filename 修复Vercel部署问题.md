# 🔧 修复 Vercel 部署问题

## 问题 1：构建错误

### 问题描述
Vercel 构建日志显示 `vite build` 命令执行，但可能因为参数问题导致警告。

### 解决方案

#### 方案 A：修改 package.json 构建命令（推荐）

修改 `package.json` 中的 build 命令，移除可能导致问题的参数：

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

Vercel 会自动检测 Vite 项目并使用正确的配置。

#### 方案 B：在 Vercel 中覆盖构建命令

1. 进入 Vercel Dashboard → 项目设置 → General
2. 找到 "Build & Development Settings"
3. 在 "Build Command" 中设置为：`npm run build` 或 `vite build`
4. 在 "Output Directory" 中设置为：`dist`

---

## 问题 2：Google 登录显示 localhost 拒绝访问

### 问题原因

Google OAuth 登录失败，显示 "localhost 拒绝访问" 的原因是：
1. **Supabase OAuth 配置中的 Redirect URL 不正确**
2. **代码中的 `redirectTo` 在生产环境使用了错误的 URL**

### 解决方案

#### 步骤 1：在 Supabase Dashboard 配置 OAuth Redirect URL

1. 打开 Supabase Dashboard：https://supabase.com/dashboard
2. 选择你的项目：`zrfnnerdaijcmhlemqld`
3. 点击左侧 **"Authentication"** → **"URL Configuration"**
4. 在 **"Redirect URLs"** 部分，添加你的 Vercel 域名：

```
https://你的域名.vercel.app/**
https://你的域名.vercel.app
```

**例如：**
```
https://invet-test.vercel.app/**
https://invet-test.vercel.app
```

5. 点击 **"Save"** 保存

#### 步骤 2：配置 Google OAuth Provider

1. 在 Supabase Dashboard 中，点击 **"Authentication"** → **"Providers"**
2. 找到 **"Google"** provider
3. 确保已启用（Toggle 打开）
4. 检查 **"Redirect URL"** 是否包含你的 Vercel 域名

**Google OAuth 配置中的 Redirect URL 应该是：**
```
https://zrfnnerdaijcmhlemqld.supabase.co/auth/v1/callback
```

这个 URL 是 Supabase 的 OAuth 回调地址，不需要修改。

#### 步骤 3：验证代码中的 redirectTo

代码中已经使用了 `window.location.origin`，这是正确的。但需要确保：
- 在生产环境中，`window.location.origin` 是你的 Vercel 域名
- 不是 `localhost`

#### 步骤 4：测试 OAuth 登录

1. 部署到 Vercel
2. 访问你的 Vercel 域名
3. 点击 "Google 登录"
4. 选择 Google 账号
5. 应该能成功登录并跳转回你的应用

---

## 📝 完整配置清单

### Supabase Dashboard 配置

#### 1. URL Configuration
- **Site URL**: `https://你的域名.vercel.app`
- **Redirect URLs**: 
  ```
  https://你的域名.vercel.app/**
  https://你的域名.vercel.app
  http://localhost:5173/**  (开发环境)
  ```

#### 2. Google OAuth Provider
- **Enabled**: ✅ 开启
- **Client ID**: 你的 Google OAuth Client ID
- **Client Secret**: 你的 Google OAuth Client Secret
- **Redirect URL** (在 Google Cloud Console 配置): 
  ```
  https://zrfnnerdaijcmhlemqld.supabase.co/auth/v1/callback
  ```

### Google Cloud Console 配置

1. 访问：https://console.cloud.google.com
2. 选择你的项目
3. 进入 **"APIs & Services"** → **"Credentials"**
4. 找到你的 OAuth 2.0 Client ID
5. 在 **"Authorized redirect URIs"** 中添加：
   ```
   https://zrfnnerdaijcmhlemqld.supabase.co/auth/v1/callback
   ```

---

## 🔍 验证步骤

### 1. 检查 Supabase 配置

在 Supabase Dashboard → Authentication → URL Configuration：
- ✅ Site URL 设置为 Vercel 域名
- ✅ Redirect URLs 包含 Vercel 域名

### 2. 检查 Google Cloud Console

在 Google Cloud Console → Credentials：
- ✅ Authorized redirect URIs 包含 Supabase 回调 URL

### 3. 测试登录流程

1. 访问 Vercel 部署的网站
2. 点击 "Google 登录"
3. 应该跳转到 Google 登录页面
4. 登录后应该跳转回你的网站（不是 localhost）

---

## 🐛 常见问题

### Q: 登录后还是跳转到 localhost？

**A:** 检查：
1. Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
2. 确保包含你的 Vercel 域名
3. 清除浏览器缓存和 cookies
4. 重新测试

### Q: 显示 "redirect_uri_mismatch" 错误？

**A:** 这表示 Google OAuth 配置中的 Redirect URI 不匹配：
1. 检查 Google Cloud Console 中的 Authorized redirect URIs
2. 确保包含：`https://zrfnnerdaijcmhlemqld.supabase.co/auth/v1/callback`
3. 注意：这个 URL 是 Supabase 的回调地址，不是你的网站地址

### Q: 构建成功但网站无法访问？

**A:** 检查：
1. Vercel 部署状态是否为 "Ready"
2. 环境变量是否正确配置
3. 查看 Vercel 的 Function Logs 是否有错误

---

## ✅ 完成检查清单

- [ ] 修改 `package.json` 构建命令（如果需要）
- [ ] 在 Supabase Dashboard 配置 Site URL 为 Vercel 域名
- [ ] 在 Supabase Dashboard 配置 Redirect URLs 包含 Vercel 域名
- [ ] 在 Google Cloud Console 配置 Authorized redirect URIs
- [ ] 重新部署到 Vercel
- [ ] 测试 Google 登录功能
- [ ] 验证登录后跳转正确

---

## 🚀 快速修复步骤

1. **修复构建命令**（如果需要）：
   ```bash
   # 修改 package.json，简化 build 命令
   ```

2. **配置 Supabase Redirect URLs**：
   - Supabase Dashboard → Authentication → URL Configuration
   - 添加：`https://你的域名.vercel.app/**`

3. **重新部署**：
   - 推送到 GitHub，Vercel 自动部署
   - 或手动在 Vercel Dashboard 点击 "Redeploy"

4. **测试**：
   - 访问 Vercel 域名
   - 测试 Google 登录

---

完成这些步骤后，Google 登录应该可以正常工作了！🎉


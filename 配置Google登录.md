# 🔐 配置 Google 登录（解决 localhost 拒绝访问问题）

## ❌ 问题描述

Google 登录时显示 "localhost 拒绝访问"，登录失败。

## 🔍 问题原因

Supabase OAuth 配置中的 **Redirect URLs** 没有包含你的 Vercel 生产环境域名。

## ✅ 解决方案

### 步骤 1：在 Supabase Dashboard 配置 Redirect URLs

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择项目：`zrfnnerdaijcmhlemqld`

2. **进入 URL Configuration**
   - 点击左侧 **"Authentication"**
   - 点击 **"URL Configuration"** 标签

3. **配置 Site URL**
   - **Site URL**: 设置为你的 Vercel 域名
   - 例如：`https://invet-test.vercel.app`

4. **配置 Redirect URLs**（重要！）
   - 在 **"Redirect URLs"** 输入框中，添加以下 URL（每行一个）：
   ```
   https://你的域名.vercel.app/**
   https://你的域名.vercel.app
   http://localhost:5173/**
   http://localhost:5173
   ```
   
   **示例（替换为你的实际域名）：**
   ```
   https://invet-test.vercel.app/**
   https://invet-test.vercel.app
   http://localhost:5173/**
   http://localhost:5173
   ```

5. **保存配置**
   - 点击 **"Save"** 按钮
   - 等待几秒钟让配置生效

### 步骤 2：验证 Google OAuth Provider 配置

1. **检查 Google Provider 是否启用**
   - 在 Supabase Dashboard → **"Authentication"** → **"Providers"**
   - 找到 **"Google"** provider
   - 确保 Toggle 开关是 **开启状态**（绿色）

2. **检查 Google OAuth 凭据**
   - 确保已配置 **Client ID** 和 **Client Secret**
   - 如果还没有，需要：
     - 在 Google Cloud Console 创建 OAuth 2.0 凭据
     - 将 Client ID 和 Secret 填入 Supabase

### 步骤 3：在 Google Cloud Console 配置 Redirect URI

1. **访问 Google Cloud Console**
   - 打开：https://console.cloud.google.com
   - 选择你的项目

2. **进入 OAuth 凭据页面**
   - 点击左侧 **"APIs & Services"**
   - 点击 **"Credentials"**
   - 找到你的 OAuth 2.0 Client ID

3. **配置 Authorized redirect URIs**
   - 点击你的 OAuth 2.0 Client ID
   - 在 **"Authorized redirect URIs"** 部分，添加：
   ```
   https://zrfnnerdaijcmhlemqld.supabase.co/auth/v1/callback
   ```
   - **注意**：这是 Supabase 的回调地址，不是你的网站地址
   - 点击 **"Save"** 保存

### 步骤 4：测试登录

1. **访问你的 Vercel 网站**
   - 打开：`https://你的域名.vercel.app`

2. **测试 Google 登录**
   - 点击 "Google 登录" 按钮
   - 应该跳转到 Google 登录页面
   - 选择 Google 账号
   - 登录后应该跳转回你的网站（**不是 localhost**）

3. **验证登录成功**
   - 应该能看到用户已登录
   - 可以访问需要登录的功能

---

## 📋 配置检查清单

### Supabase Dashboard 配置

- [ ] **Site URL** 设置为 Vercel 域名
  - 例如：`https://invet-test.vercel.app`

- [ ] **Redirect URLs** 包含以下所有 URL：
  - [ ] `https://你的域名.vercel.app/**`
  - [ ] `https://你的域名.vercel.app`
  - [ ] `http://localhost:5173/**`（开发环境）
  - [ ] `http://localhost:5173`（开发环境）

- [ ] **Google Provider** 已启用
  - [ ] Toggle 开关为绿色（开启）
  - [ ] Client ID 已配置
  - [ ] Client Secret 已配置

### Google Cloud Console 配置

- [ ] **Authorized redirect URIs** 包含：
  - [ ] `https://zrfnnerdaijcmhlemqld.supabase.co/auth/v1/callback`

---

## 🐛 常见问题

### Q1: 登录后还是跳转到 localhost？

**解决方法：**
1. 检查 Supabase Dashboard → Authentication → URL Configuration
2. 确保 **Redirect URLs** 包含你的 Vercel 域名
3. 清除浏览器缓存和 cookies
4. 重新测试

### Q2: 显示 "redirect_uri_mismatch" 错误？

**原因：** Google OAuth 配置中的 Redirect URI 不匹配

**解决方法：**
1. 检查 Google Cloud Console → Credentials → OAuth 2.0 Client ID
2. 在 **"Authorized redirect URIs"** 中添加：
   ```
   https://zrfnnerdaijcmhlemqld.supabase.co/auth/v1/callback
   ```
3. **注意**：这个 URL 是 Supabase 的回调地址，不是你的网站地址

### Q3: 显示 "access_denied" 错误？

**原因：** 用户取消了 Google 登录授权

**解决方法：**
- 这是正常的，用户可以选择不授权
- 重新点击登录按钮即可

### Q4: 配置后还是不行？

**解决方法：**
1. **等待配置生效**：Supabase 配置可能需要几秒钟生效
2. **清除浏览器缓存**：清除 cookies 和缓存后重试
3. **检查域名是否正确**：确保 Supabase 中的域名和 Vercel 域名完全一致（包括 https）
4. **查看浏览器控制台**：F12 打开控制台，查看是否有错误信息

---

## 🔄 配置更新流程

如果更换了 Vercel 域名，需要：

1. **更新 Supabase Redirect URLs**
   - 添加新的域名
   - 可以保留旧的域名（如果还在使用）

2. **更新 Site URL**
   - 设置为新的 Vercel 域名

3. **重新测试**
   - 清除缓存后测试登录

---

## ✅ 验证配置是否正确

### 方法 1：检查 Supabase 配置

在 Supabase Dashboard → Authentication → URL Configuration：
- ✅ Site URL: `https://你的域名.vercel.app`
- ✅ Redirect URLs 包含：`https://你的域名.vercel.app/**`

### 方法 2：测试登录流程

1. 访问 Vercel 网站
2. 点击 Google 登录
3. 登录后应该跳转回你的网站（不是 localhost）
4. 应该能看到用户已登录

### 方法 3：查看浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 "Network" 标签
3. 点击 Google 登录
4. 查看网络请求，确认 redirect_uri 参数正确

---

## 🎯 快速修复步骤

1. **Supabase Dashboard** → Authentication → URL Configuration
2. **添加 Redirect URL**：`https://你的域名.vercel.app/**`
3. **保存配置**
4. **等待几秒钟**让配置生效
5. **清除浏览器缓存**
6. **重新测试登录**

---

完成这些步骤后，Google 登录应该可以正常工作了！🎉

如果还有问题，请检查：
- Supabase Dashboard 中的配置是否正确
- Google Cloud Console 中的 Redirect URI 是否正确
- 浏览器控制台是否有错误信息


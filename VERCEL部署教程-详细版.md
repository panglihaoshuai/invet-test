# 🚀 Vercel 部署详细教程（手把手教学）

## 📋 前置准备

### ✅ 已完成
- ✅ 代码已推送到 GitHub：https://github.com/panglihaoshuai/invet-test
- ✅ 项目已清理，结构优化完成

### 📝 需要准备的信息

在开始部署前，准备好以下信息：

1. **Supabase 项目 URL**
   - 值：`https://zrfnnerdaijcmhlemqld.supabase.co`
   - 位置：Supabase Dashboard → Project Settings → API

2. **Supabase 匿名密钥（Anon Key）**
   - 值：你的 `anon` `public` 密钥
   - 位置：Supabase Dashboard → Project Settings → API → anon public

## 🎯 第一步：登录 Vercel

### 1.1 访问 Vercel 网站

1. 打开浏览器，访问：**https://vercel.com**
2. 点击右上角的 **"Sign Up"** 或 **"Log In"**

### 1.2 选择登录方式

**推荐方式：使用 GitHub 登录**
- 点击 **"Continue with GitHub"**
- 授权 Vercel 访问你的 GitHub 账号
- 这样可以直接连接 GitHub 仓库，非常方便

**其他方式：**
- 也可以使用 GitLab、Bitbucket 或邮箱登录

## 🔗 第二步：导入项目

### 2.1 进入导入页面

登录后，你会看到 Vercel Dashboard：
1. 点击右上角的 **"Add New..."** 按钮
2. 选择 **"Project"**

或者直接访问：https://vercel.com/new

### 2.2 选择仓库

1. 在仓库列表中，找到 **`panglihaoshuai/invet-test`**
2. 如果看不到，点击 **"Import Git Repository"**
3. 输入仓库地址：`panglihaoshuai/invet-test`
4. 点击 **"Import"**

### 2.3 配置项目（重要！）

Vercel 会自动检测项目类型，但需要手动配置一个关键设置：

#### ✅ Root Directory 设置

**根据你的 GitHub 仓库结构，项目代码已经在根目录了！**

**配置步骤：**

1. 在项目配置页面，找到 **"Root Directory"** 选项
2. **留空或设置为 `.`**（根目录）
   - 如果看到目录选择界面，直接选择 `invet-test`（根目录）
   - 你应该能看到：`docs`、`public`、`rules`、`src`、`supabase` 等目录
3. 点击 **"Continue"**

**为什么这样设置？**
- 你的 GitHub 仓库根目录直接就是项目代码（`package.json`、`src`、`public` 等都在根目录）
- 不需要设置为 `app-7gjbw3zqrmdd`，因为代码已经推送到根目录了

#### 其他设置（通常自动检测，确认即可）

- **Framework Preset**: `Vite` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅
- **Install Command**: `npm install` ✅

## 🔐 第三步：配置环境变量

### 3.1 添加环境变量

在部署前，必须添加环境变量：

1. 在项目配置页面，找到 **"Environment Variables"** 部分
2. 点击 **"Add"** 或 **"Add New"**

### 3.2 添加必需的环境变量

**变量 1：VITE_SUPABASE_URL**
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://zrfnnerdaijcmhlemqld.supabase.co`
- **Environment**: 选择所有环境（Production、Preview、Development）

**变量 2：VITE_SUPABASE_ANON_KEY**
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: 你的 Supabase 匿名密钥（从 Supabase Dashboard 获取）
- **Environment**: 选择所有环境（Production、Preview、Development）

### 3.3 可选环境变量

如果需要，可以添加：

**变量 3：VITE_DEFAULT_LANGUAGE**（可选）
- **Key**: `VITE_DEFAULT_LANGUAGE`
- **Value**: `zh`
- **Environment**: 所有环境

**变量 4：VITE_WECHAT_REWARD_IMG**（可选）
- **Key**: `VITE_WECHAT_REWARD_IMG`
- **Value**: 微信赞赏码图片 URL（如果使用外部图片）
- **Environment**: 所有环境

### 3.4 如何获取 Supabase 密钥

1. 打开 Supabase Dashboard：https://supabase.com/dashboard
2. 选择你的项目：`zrfnnerdaijcmhlemqld`
3. 点击左侧 **"Project Settings"**（齿轮图标）
4. 点击 **"API"**
5. 找到 **"Project URL"** 和 **"anon public"** 密钥
6. 复制这些值到 Vercel 环境变量中

## 🚀 第四步：部署

### 4.1 开始部署

1. 确认所有设置正确：
   - ✅ Root Directory: `app-7gjbw3zqrmdd`
   - ✅ Framework: Vite
   - ✅ 环境变量已添加
2. 点击页面底部的 **"Deploy"** 按钮

### 4.2 等待部署完成

部署过程通常需要 1-3 分钟，你会看到：
- 📦 Installing dependencies（安装依赖）
- 🔨 Building（构建项目）
- ✅ Deploying（部署）

### 4.3 部署成功

部署完成后，你会看到：
- ✅ **"Congratulations! Your project has been deployed"**
- 🌐 **你的网站 URL**（例如：`https://invet-test.vercel.app`）

## ✅ 第五步：验证部署

### 5.1 访问网站

1. 点击 Vercel 提供的 URL
2. 检查页面是否正常加载
3. 打开浏览器控制台（F12），检查是否有错误

### 5.2 测试功能

测试以下功能是否正常：
- ✅ 用户注册/登录
- ✅ 测试流程
- ✅ 分析生成
- ✅ 支付功能（如果启用）

### 5.3 检查环境变量

在浏览器控制台运行：
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

应该能看到正确的值。

## 🔄 更新部署

### 自动部署（推荐）

每次推送到 GitHub 的 `main` 分支，Vercel 会自动：
1. 检测到代码更新
2. 自动触发新的部署
3. 构建并部署新版本

**工作流程：**
```bash
# 1. 修改代码
# 2. 提交并推送
git add .
git commit -m "更新功能"
git push github HEAD:main

# 3. Vercel 自动部署（无需手动操作）
```

### 手动部署

如果需要手动触发部署：
1. 在 Vercel Dashboard 中，进入项目
2. 点击 **"Deployments"** 标签
3. 点击 **"Redeploy"** 按钮

## 🐛 常见问题解决

### ❌ 问题 1：构建失败 - 找不到 package.json

**错误信息：**
```
Error: Could not find package.json
```

**原因：** Root Directory 设置错误

**解决方法：**
1. 进入项目设置（Settings）
2. 找到 **"Root Directory"**
3. **设置为根目录（`.` 或留空）**，不要设置为 `app-7gjbw3zqrmdd`
4. 重新部署

### ❌ 问题 2：环境变量未生效

**症状：** 网站无法连接 Supabase

**解决方法：**
1. 检查环境变量名称是否正确（必须以 `VITE_` 开头）
2. 检查是否选择了正确的环境（Production/Preview/Development）
3. **重要**：环境变量更改后，需要重新部署
   - 在 Deployments 页面点击 "Redeploy"

### ❌ 问题 3：路由 404 错误

**症状：** 刷新页面或直接访问路由时出现 404

**解决方法：**
- 检查 `vercel.json` 文件是否存在
- 确认 `rewrites` 配置正确（已配置，应该没问题）

### ❌ 问题 4：API 调用失败

**症状：** 前端无法调用 Supabase API

**解决方法：**
1. 检查环境变量是否正确
2. 在浏览器控制台查看具体错误
3. 检查 Supabase 项目的 CORS 设置

### ❌ 问题 5：部署很慢或超时

**解决方法：**
1. 检查构建日志，看是否有错误
2. 确保 `node_modules` 在 `.gitignore` 中（不要提交）
3. 如果依赖很多，Vercel 会自动缓存，第二次部署会更快

## 📊 查看部署状态

### 在 Vercel Dashboard 中

1. **Deployments 标签**：
   - 查看所有部署历史
   - 查看每个部署的状态（成功/失败）
   - 查看构建日志

2. **Analytics 标签**：
   - 查看访问统计
   - 查看性能指标

3. **Settings 标签**：
   - 修改项目设置
   - 管理环境变量
   - 配置域名

## 🎨 自定义域名（可选）

### 添加自定义域名

1. 在 Vercel Dashboard 中，进入项目
2. 点击 **"Settings"** → **"Domains"**
3. 输入你的域名（例如：`yourdomain.com`）
4. 按照提示配置 DNS 记录
5. 等待 DNS 生效（通常几分钟到几小时）

### DNS 配置示例

**如果使用根域名（yourdomain.com）：**
```
类型: A
名称: @
值: 76.76.21.21
```

**如果使用子域名（www.yourdomain.com）：**
```
类型: CNAME
名称: www
值: cname.vercel-dns.com
```

## 📝 部署检查清单

在部署前，确认以下项目：

- [ ] GitHub 仓库已准备好
- [ ] 已登录 Vercel
- [ ] 已导入项目
- [ ] **Root Directory 已设置为根目录（`.` 或留空）** ✅
- [ ] 已添加 `VITE_SUPABASE_URL` 环境变量
- [ ] 已添加 `VITE_SUPABASE_ANON_KEY` 环境变量
- [ ] 已点击 "Deploy" 按钮
- [ ] 部署成功，网站可以访问
- [ ] 测试了基本功能

## 🎉 完成！

部署成功后，你的应用就可以通过 Vercel 提供的 URL 访问了！

**下一步：**
- ✅ 测试所有功能
- ✅ 配置自定义域名（可选）
- ✅ 享受自动部署的便利

---

## 💡 提示

1. **每次推送代码到 GitHub，Vercel 会自动部署**，非常方便！
2. **环境变量更改后需要重新部署**才能生效
3. **Root Directory 应该设置为根目录（`.` 或留空）**，因为你的项目代码已经在 GitHub 仓库根目录了
4. 如果遇到问题，查看 Vercel Dashboard 中的构建日志，那里有详细的错误信息

## 📚 参考资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Supabase 文档](https://supabase.com/docs)

---

**需要帮助？** 如果遇到问题，可以：
1. 查看 Vercel Dashboard 中的构建日志
2. 查看浏览器控制台的错误信息
3. 参考本文档的"常见问题解决"部分


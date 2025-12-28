# 🚀 Vercel 快速部署指南（5分钟上手）

## ✅ 前置条件

- ✅ 代码已提交到 Git 仓库（GitHub/GitLab/Bitbucket）
- ✅ 准备好 Supabase 环境变量

## 📝 第一步：准备环境变量

在部署前，准备好以下值：

1. **VITE_SUPABASE_URL**
   - 值：`https://zrfnnerdaijcmhlemqld.supabase.co`
   - 来源：Supabase Dashboard → Project Settings → API

2. **VITE_SUPABASE_ANON_KEY**
   - 值：你的 Supabase 匿名密钥
   - 来源：Supabase Dashboard → Project Settings → API → anon public key

3. **VITE_DEFAULT_LANGUAGE**（可选）
   - 值：`zh` 或 `en`
   - 默认：`zh`

4. **VITE_WECHAT_REWARD_IMG**（可选）
   - 值：微信赞赏码图片 URL
   - 如果留空，会使用 `public/wechat-reward.jpg`

## 🎯 第二步：部署到 Vercel

### 方法 A：通过网页（最简单，推荐）

#### 1. 访问 Vercel
- 打开：https://vercel.com
- 使用 GitHub/GitLab/Bitbucket 账号登录

#### 2. 导入项目
- 点击 **"Add New Project"** 或 **"New Project"**
- 选择你的 Git 提供商
- 授权 Vercel 访问仓库
- 找到项目，点击 **"Import"**

#### 3. 配置项目

**如果项目在子目录 `app-7gjbw3zqrmdd`：**
- **Root Directory**: 设置为 `app-7gjbw3zqrmdd`
- **Framework Preset**: `Vite`（自动检测）
- **Build Command**: `npm run build`（默认）
- **Output Directory**: `dist`（默认）

**如果项目在根目录：**
- 保持默认设置即可

#### 4. 添加环境变量

在部署前，点击 **"Environment Variables"**，添加：

```
VITE_SUPABASE_URL = https://zrfnnerdaijcmhlemqld.supabase.co
VITE_SUPABASE_ANON_KEY = 你的_ANON_KEY
```

**可选变量：**
```
VITE_DEFAULT_LANGUAGE = zh
VITE_WECHAT_REWARD_IMG = https://你的图片URL
```

**如何添加：**
1. 点击 **"Environment Variables"**
2. 点击 **"Add New"**
3. 输入变量名和值
4. 选择环境：**Production**、**Preview**、**Development**（全选）
5. 点击 **"Save"**

#### 5. 部署

1. 确认所有设置
2. 点击 **"Deploy"** 按钮
3. 等待 1-3 分钟

#### 6. 完成！

部署成功后，你会看到：
- ✅ 部署成功的消息
- 🌐 你的网站 URL（例如：`https://your-project.vercel.app`）

### 方法 B：使用 CLI（适合开发者）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 进入项目目录
cd D:\Trae\rengeceshi\app-7gjbw3zqrmdd

# 4. 部署（首次会引导配置）
vercel

# 5. 添加环境变量
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# 6. 部署到生产环境
vercel --prod
```

## ✅ 第三步：验证部署

### 1. 访问网站
打开 Vercel 提供的 URL，检查：
- ✅ 页面正常加载
- ✅ 没有控制台错误

### 2. 测试功能
- ✅ 用户注册/登录
- ✅ 测试流程
- ✅ 分析生成

### 3. 检查环境变量
在浏览器控制台（F12）运行：
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

## 🔄 更新部署

### 自动部署（推荐）

每次推送到主分支，Vercel 会自动部署：

```bash
git add .
git commit -m "更新功能"
git push origin main
# Vercel 自动部署，无需手动操作
```

### 手动部署

在 Vercel Dashboard：
1. 进入项目
2. 点击 **"Deployments"**
3. 点击 **"Redeploy"**

## 🐛 常见问题

### ❌ 构建失败

**检查：**
- 查看构建日志中的错误信息
- 确保所有依赖都在 `package.json` 中
- 检查 Node.js 版本（Vercel 默认 18.x）

### ❌ 环境变量未生效

**解决：**
- 确保变量名以 `VITE_` 开头
- 重新部署项目（环境变量更改后需要重新部署）
- 检查是否选择了正确的环境（Production/Preview/Development）

### ❌ 路由 404 错误

**解决：**
- 检查 `vercel.json` 中的 `rewrites` 配置
- 确保所有路由都重定向到 `index.html`

### ❌ API 调用失败

**解决：**
- 检查 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
- 查看浏览器控制台的错误信息

## 📚 更多信息

详细部署指南请查看：`VERCEL完整部署指南.md`

## 🎉 完成！

恭喜！你的应用已经部署到 Vercel 了！

**下一步：**
- ✅ 测试所有功能
- ✅ 配置自定义域名（可选）
- ✅ 享受自动部署的便利

---

**提示**：如果项目在子目录，记得在 Vercel 设置中配置 **Root Directory** 为 `app-7gjbw3zqrmdd`！



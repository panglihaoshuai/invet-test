# 认证与注册

## 目标
- 支持邮箱+密码注册与登录
- 注册成功后提示妥善保存密码，并自动复制账号与密码到剪贴板
- 不提供密码找回功能

## 流程
1. 登录页提供注册模式与登录模式切换
2. 注册：输入邮箱，系统生成一次性密码（或用户输入），调用后端函数完成注册
3. 注册成功：Toast 提示，并复制邮箱与密码到剪贴板
4. 登录：输入邮箱与密码，验证后进入首页

## 依赖
- Supabase Edge Functions：`register-password`、`login-password`、`verify-token`
- 环境变量：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`


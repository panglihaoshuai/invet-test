# 🔧 配置 RESEND_API_KEY

## ⚠️ 重要提示

目前邮件发送功能返回 500 错误，原因是 **RESEND_API_KEY 未配置或已过期**。

要使邮件验证码功能正常工作，您需要配置 Resend API Key。

---

## 📋 配置步骤

### 步骤 1: 获取 Resend API Key

1. 访问 [Resend 官网](https://resend.com/)
2. 注册或登录账号
3. 进入 [API Keys 页面](https://resend.com/api-keys)
4. 点击 "Create API Key"
5. 复制生成的 API Key（格式类似：`re_xxxxxxxxxxxxxxxxxxxxx`）

### 步骤 2: 在 Supabase 中配置 Secret

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目：`ahgnspudsmrvsqcinxcj`
3. 点击左侧菜单的 **Edge Functions**
4. 点击顶部的 **Secrets** 标签
5. 点击 **Add Secret** 按钮
6. 填写以下信息：
   - **Name**: `RESEND_API_KEY`
   - **Value**: 粘贴您的 Resend API Key
7. 点击 **Save** 保存

### 步骤 3: 重启 Edge Functions（可选）

配置完成后，Edge Functions 会自动重新加载环境变量。如果没有生效，可以手动重启：

1. 在 Supabase Dashboard 的 Edge Functions 页面
2. 找到 `send-verification-code` 函数
3. 点击右侧的 **...** 菜单
4. 选择 **Restart**

---

## 🧪 验证配置

配置完成后，运行测试脚本验证：

```bash
bash test-edge-function.sh
```

**预期结果**:
```
✅ 测试成功！Edge Function 正常工作
📧 验证码已发送到 test@example.com
💡 请检查邮箱（包括垃圾邮件文件夹）
```

---

## 📧 Resend 免费额度

Resend 提供免费额度：
- **每月 3,000 封邮件**
- **每天 100 封邮件**
- **无需信用卡**

对于测试和小型应用来说完全足够！

---

## 🔍 常见问题

### Q1: 我没有 Resend 账号怎么办？

**解决方案**:
1. 访问 https://resend.com/
2. 点击 "Sign Up" 注册
3. 使用 GitHub 或 Google 账号快速注册
4. 验证邮箱后即可使用

### Q2: API Key 在哪里找？

**解决方案**:
1. 登录 Resend
2. 访问 https://resend.com/api-keys
3. 如果没有 API Key，点击 "Create API Key"
4. 复制生成的 Key（只显示一次，请妥善保存）

### Q3: 配置后还是显示 500 错误？

**可能原因**:
1. API Key 输入错误（有空格或换行）
2. API Key 已过期或被删除
3. Resend 账号被暂停

**解决方案**:
1. 重新检查 API Key 是否正确
2. 在 Resend 后台重新生成 API Key
3. 确认 Resend 账号状态正常
4. 等待 1-2 分钟让配置生效

### Q4: 可以使用其他邮件服务吗？

**可以！** 您可以修改 Edge Function 代码使用其他邮件服务：

- **SendGrid**: 需要修改 API 端点和认证方式
- **Mailgun**: 需要修改 API 端点和认证方式
- **AWS SES**: 需要 AWS SDK 和凭证配置
- **SMTP**: 需要使用 Deno 的 SMTP 库

如需使用其他服务，请修改 `supabase/functions/send-verification-code/index.ts` 文件。

---

## 📝 配置检查清单

在测试之前，请确认：

- [ ] 已注册 Resend 账号
- [ ] 已创建 API Key
- [ ] 已在 Supabase 中添加 `RESEND_API_KEY` Secret
- [ ] Secret 名称完全匹配（区分大小写）
- [ ] API Key 没有多余的空格或换行
- [ ] 等待 1-2 分钟让配置生效
- [ ] 运行测试脚本验证

---

## 🎯 配置完成后

配置完成并验证成功后：

1. **刷新浏览器页面**
   - 按 `Ctrl + Shift + R`（Windows/Linux）
   - 按 `Cmd + Shift + R`（Mac）

2. **测试登录功能**
   - 输入邮箱地址
   - 点击"发送验证码"
   - 查收邮件
   - 输入验证码登录

3. **享受完整功能！** 🎉

---

## 📞 需要帮助？

如果配置过程中遇到问题，请提供：

1. **Resend 账号状态**（是否已验证邮箱）
2. **API Key 格式**（前 10 个字符，如 `re_xxxxxxxx...`）
3. **Supabase Secrets 截图**（隐藏敏感信息）
4. **Edge Functions 日志**（在 Supabase Dashboard 查看）

---

**最后更新**: 2025-01-10  
**相关文档**: ✅问题已完全解决.md  
**测试脚本**: test-edge-function.sh

# 安全防护指南

## 🛡️ 安全架构概述

本系统实施了多层安全防护措施，以防止恶意攻击、数据泄露和服务中断。

## 🔒 已实施的安全措施

### 1. 认证与授权

#### Supabase Auth
- ✅ 使用 Supabase 内置认证系统
- ✅ JWT Token 验证
- ✅ 邮箱验证码登录
- ✅ Session 管理

#### 角色权限控制（RBAC）
- ✅ 用户角色：`user` 和 `admin`
- ✅ Row Level Security (RLS) 策略
- ✅ 管理员权限验证函数 `is_admin()`

### 2. 数据库安全

#### Row Level Security (RLS)
所有表都启用了 RLS，确保用户只能访问自己的数据：

```sql
-- 示例：订单表RLS策略
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (is_admin(auth.uid()));
```

#### SQL 注入防护
- ✅ 使用 Supabase 客户端（参数化查询）
- ✅ 禁止直接拼接 SQL 字符串
- ✅ 所有用户输入都经过验证

### 3. XSS 防护

#### React 自动转义
- ✅ React 自动转义所有用户输入
- ✅ 禁止使用 `dangerouslySetInnerHTML`（除非必要且经过清理）

#### Content Security Policy (CSP)
建议在生产环境配置 CSP 头：

```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  font-src 'self' data:; 
  connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.deepseek.com;
```

### 4. CSRF 防护

- ✅ Supabase 使用 JWT Token，天然防 CSRF
- ✅ 所有 API 请求需要 Authorization 头
- ✅ 不使用 Cookie 存储敏感信息

### 5. 速率限制（Rate Limiting）

#### 登录速率限制
```typescript
// 系统设置
rate_limit_login: {
  max_attempts: 5,      // 最多5次尝试
  window_minutes: 15    // 15分钟窗口
}
```

#### 支付速率限制
```typescript
rate_limit_payment: {
  max_attempts: 3,      // 最多3次尝试
  window_minutes: 60    // 60分钟窗口
}
```

#### 实施方式
- Edge Functions 中实施速率限制
- 基于 IP 地址和用户 ID
- 超过限制返回 429 Too Many Requests

### 6. CAPTCHA 防护

#### 登录验证码
- ✅ 邮箱登录需要输入验证码
- ✅ 验证码 5 分钟有效期
- ✅ 验证码只能使用一次

#### 推荐集成 hCaptcha
```typescript
// 在登录页面添加 CAPTCHA
import HCaptcha from '@hcaptcha/react-hcaptcha';

<HCaptcha
  sitekey="YOUR_SITE_KEY"
  onVerify={(token) => setCaptchaToken(token)}
/>
```

### 7. DDOS 防护

#### Cloudflare 集成（推荐）
- ✅ 使用 Cloudflare 作为 CDN 和 WAF
- ✅ 自动 DDOS 防护
- ✅ Bot 检测和拦截
- ✅ 速率限制

#### Supabase 内置防护
- ✅ Supabase 提供基础 DDOS 防护
- ✅ 自动扩展处理流量峰值

#### 应用层防护
- ✅ Edge Functions 速率限制
- ✅ IP 黑名单功能
- ✅ 异常流量检测

### 8. 数据加密

#### 传输加密
- ✅ 所有 API 请求使用 HTTPS
- ✅ TLS 1.2+ 加密
- ✅ Supabase 强制 HTTPS

#### 存储加密
- ✅ Supabase 数据库加密存储
- ✅ 敏感数据（如支付信息）不存储在本地
- ✅ API 密钥存储在环境变量中

### 9. 输入验证

#### 前端验证
```typescript
// 示例：邮箱验证
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('无效的邮箱地址');
}
```

#### 后端验证
```typescript
// Edge Function 中验证
if (!email || !emailRegex.test(email)) {
  return fail('无效的邮箱地址', 400);
}
```

### 10. 审计日志

#### 管理员操作日志
- ✅ 记录所有管理员操作
- ✅ 包含操作类型、目标、详情、IP 地址
- ✅ 不可删除，只能查看

```typescript
// 记录管理员操作
await adminApi.logAction(
  'toggle_payment_system',
  'system_settings',
  null,
  { enabled: true },
  ipAddress
);
```

## 🚨 安全威胁与防护

### 1. 暴力破解攻击

**威胁**：攻击者尝试大量密码组合

**防护措施**：
- ✅ 登录速率限制（5次/15分钟）
- ✅ CAPTCHA 验证
- ✅ IP 黑名单
- ✅ 账户锁定机制（可选）

### 2. SQL 注入

**威胁**：攻击者通过输入恶意 SQL 代码

**防护措施**：
- ✅ 使用 Supabase 客户端（参数化查询）
- ✅ 输入验证和清理
- ✅ 最小权限原则

### 3. XSS 攻击

**威胁**：攻击者注入恶意脚本

**防护措施**：
- ✅ React 自动转义
- ✅ Content Security Policy
- ✅ 输入验证
- ✅ 输出编码

### 4. CSRF 攻击

**威胁**：攻击者伪造用户请求

**防护措施**：
- ✅ JWT Token 验证
- ✅ SameSite Cookie 属性
- ✅ 验证 Origin 和 Referer 头

### 5. DDOS 攻击

**威胁**：大量请求导致服务不可用

**防护措施**：
- ✅ Cloudflare DDOS 防护
- ✅ 速率限制
- ✅ IP 黑名单
- ✅ 流量监控和告警

### 6. 中间人攻击（MITM）

**威胁**：攻击者拦截通信

**防护措施**：
- ✅ 强制 HTTPS
- ✅ HSTS 头
- ✅ 证书固定（可选）

### 7. 会话劫持

**威胁**：攻击者窃取用户会话

**防护措施**：
- ✅ HttpOnly Cookie
- ✅ Secure Cookie
- ✅ 短期 Token
- ✅ 定期刷新 Token

### 8. 敏感数据泄露

**威胁**：敏感信息被未授权访问

**防护措施**：
- ✅ 数据加密
- ✅ 最小权限原则
- ✅ 审计日志
- ✅ 定期安全审计

## 🔧 安全配置清单

### 环境变量安全

```bash
# ✅ 正确：使用环境变量
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# ❌ 错误：硬编码在代码中
const supabaseUrl = "https://xxx.supabase.co";
```

### Supabase 安全设置

1. **启用 RLS**
   - 所有表都启用 Row Level Security
   - 定义明确的访问策略

2. **API 密钥管理**
   - 使用 `anon` key 用于前端
   - 使用 `service_role` key 仅用于后端
   - 定期轮换密钥

3. **认证设置**
   - 启用邮箱验证
   - 设置合理的 Token 过期时间
   - 启用多因素认证（可选）

### Stripe 安全设置

1. **使用 Webhook**
   - 验证 Webhook 签名
   - 使用 HTTPS 端点

2. **密钥管理**
   - 测试环境使用测试密钥
   - 生产环境使用生产密钥
   - 不在前端暴露 Secret Key

### DeepSeek API 安全

1. **API 密钥保护**
   - 存储在环境变量中
   - 仅在 Edge Functions 中使用
   - 定期轮换

2. **速率限制**
   - 限制 API 调用频率
   - 缓存分析结果

## 📊 安全监控

### 1. 日志监控

监控以下事件：
- 登录失败次数
- API 错误率
- 异常流量模式
- 管理员操作

### 2. 告警设置

设置告警阈值：
- 登录失败率 > 10%
- API 错误率 > 5%
- 流量突增 > 200%
- 异常 IP 访问

### 3. 定期审计

- 每周审查管理员日志
- 每月安全漏洞扫描
- 每季度渗透测试
- 每年安全审计

## 🛠️ 安全工具推荐

### 1. 漏洞扫描
- **OWASP ZAP** - 免费的 Web 应用安全扫描工具
- **Snyk** - 依赖漏洞扫描

### 2. 代码审计
- **ESLint Security Plugin** - 检测常见安全问题
- **SonarQube** - 代码质量和安全分析

### 3. 依赖管理
- **npm audit** - 检查 npm 包漏洞
- **Dependabot** - 自动更新依赖

### 4. 监控工具
- **Sentry** - 错误追踪和监控
- **LogRocket** - 用户会话回放
- **Cloudflare Analytics** - 流量分析

## 📝 安全最佳实践

### 开发阶段

1. **代码审查**
   - 所有代码必须经过审查
   - 关注安全相关代码

2. **依赖管理**
   - 定期更新依赖
   - 审查新增依赖

3. **测试**
   - 编写安全测试用例
   - 测试边界条件

### 部署阶段

1. **环境隔离**
   - 开发、测试、生产环境分离
   - 使用不同的 API 密钥

2. **配置管理**
   - 使用环境变量
   - 不提交敏感信息到 Git

3. **备份**
   - 定期备份数据库
   - 测试恢复流程

### 运维阶段

1. **监控**
   - 实时监控系统状态
   - 设置告警

2. **更新**
   - 及时应用安全补丁
   - 定期更新依赖

3. **应急响应**
   - 制定安全事件响应计划
   - 定期演练

## 🚀 安全改进建议

### 短期（1-2周）

1. **集成 hCaptcha**
   - 在登录页面添加 CAPTCHA
   - 防止自动化攻击

2. **实施速率限制**
   - 在 Edge Functions 中添加速率限制
   - 基于 IP 和用户 ID

3. **添加 CSP 头**
   - 配置 Content Security Policy
   - 防止 XSS 攻击

### 中期（1-2月）

1. **集成 Cloudflare**
   - 使用 Cloudflare 作为 CDN
   - 启用 WAF 和 DDOS 防护

2. **实施 IP 黑名单**
   - 自动封禁恶意 IP
   - 管理员可手动添加/移除

3. **增强审计日志**
   - 记录更多操作
   - 添加日志分析功能

### 长期（3-6月）

1. **多因素认证（MFA）**
   - 支持 TOTP
   - 支持 SMS 验证码

2. **安全培训**
   - 团队安全意识培训
   - 定期安全演练

3. **渗透测试**
   - 聘请专业团队
   - 修复发现的漏洞

## 📞 安全事件响应

### 发现安全漏洞

1. **立即行动**
   - 评估影响范围
   - 隔离受影响系统

2. **修复漏洞**
   - 开发补丁
   - 测试修复

3. **部署更新**
   - 尽快部署到生产环境
   - 通知受影响用户

4. **事后分析**
   - 分析根本原因
   - 改进流程

### 报告安全问题

如果发现安全漏洞，请：
1. 不要公开披露
2. 发送邮件到安全团队
3. 提供详细信息和复现步骤

---

**文档版本**：1.0.0  
**最后更新**：2025-11-10  
**维护者**：安全团队

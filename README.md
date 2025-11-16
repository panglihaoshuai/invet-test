# Welcome to Your Miaoda Project
Miaoda Application Link URL
    URL:https://medo.dev/projects/app-7gjbw3zqrmdd

# 人格特质投资策略评估系统

> 基于 Big Five 人格模型的智能投资策略推荐系统

---

## 📖 系统简介

这是一个专业的投资心理评估系统,通过科学的测评方法帮助用户：
- 🧠 了解自己的人格特质
- 📊 评估数学金融能力
- 🎯 分析风险偏好
- 💡 获得个性化投资策略建议
- 🤖 获取 AI 深度心理分析（付费功能）

---

## 🚀 快速开始

### 方式一：5分钟快速测试 ⭐ 推荐

查看 **[快速开始.md](./快速开始.md)** - 最简单的测试流程

### 方式二：完整部署指南

查看 **[部署测试完整指南.md](./部署测试完整指南.md)** - 详细的部署和测试说明

### 方式三：查看系统流程

查看 **[系统流程图.md](./系统流程图.md)** - 可视化的系统流程和架构

---

## 📚 文档导航

### 核心文档
- **[快速开始.md](./快速开始.md)** - 5分钟快速测试指南 ⭐ 推荐新手
- **[部署测试完整指南.md](./部署测试完整指南.md)** - 完整的部署和测试文档
- **[系统流程图.md](./系统流程图.md)** - 系统架构和流程图
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - 详细的功能测试指南
- **[SECURITY_GUIDE.md](./SECURITY_GUIDE.md)** - 安全配置指南

### 管理员文档
- **[docs/ADMIN_SETUP.md](./docs/ADMIN_SETUP.md)** - 管理员账号设置指南
- **[docs/GIFT_CODE_PAYMENT_TESTING.md](./docs/GIFT_CODE_PAYMENT_TESTING.md)** - 礼品码和付费功能测试

### 功能文档
- **[docs/features/DEEPSEEK_INTEGRATION.md](./docs/features/DEEPSEEK_INTEGRATION.md)** - DeepSeek AI 集成
- **[docs/features/GIFT_CODE_SYSTEM_GUIDE.md](./docs/features/GIFT_CODE_SYSTEM_GUIDE.md)** - 礼品码系统
- **[docs/features/PAYMENT_FLOW.md](./docs/features/PAYMENT_FLOW.md)** - 支付流程

### 配置文档
- **[🔧配置RESEND_API_KEY.md](./🔧配置RESEND_API_KEY.md)** - 邮件服务配置

### 技术文档
- **[docs/prd.md](./docs/prd.md)** - 产品需求文档
- **[docs/SYSTEM_OVERVIEW.md](./docs/SYSTEM_OVERVIEW.md)** - 系统架构概览
- **[docs/fixes/](./docs/fixes/)** - 历史修复记录

---

## ✨ 核心功能

### 用户功能
- ✅ 邮箱验证码登录（6位数字，5分钟有效）
- ✅ 人格特质测评（Big Five 模型，50题）
- ✅ 交易特征评估
- ✅ 数学金融能力测试（10题）
- ✅ 风险偏好评估
- ✅ 投资策略智能匹配（欧几里得距离算法）
- ✅ 基础投资建议报告
- ✅ DeepSeek AI 深度分析（付费/礼品码）

### 管理员功能
- ✅ 系统数据统计（用户、订单、收入）
- ✅ 用户管理
- ✅ 订单管理
- ✅ 礼品码生成和管理
- ✅ 系统配置管理

### 商业功能
- ✅ 礼品码系统（支持多次使用、有效期设置）
- ✅ 递减价格策略（¥3.99 → ¥2.99 → ¥1.99）
- ✅ 订单管理系统
- ✅ 用户定价追踪

---

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui
- **路由**: React Router
- **状态管理**: React Context + Hooks
- **图标**: Lucide React

### 后端
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **API**: Supabase REST API
- **AI 分析**: DeepSeek API（可选）

---

## 📦 安装和运行

### 前置要求
- Node.js 18+
- pnpm（推荐）或 npm

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm run dev
```

### 构建生产版本
```bash
pnpm run build
```

### 代码检查
```bash
pnpm run lint
```

---

## 🔧 环境配置

系统已自动配置好环境变量，位于 `.env` 文件：

```env
VITE_SUPABASE_URL=https://ahgnspudsmrvsqcinxcj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_APP_ID=app-7gjbw3zqrmdd
VITE_API_ENV=production
```

---

## 📊 数据库表结构

系统包含以下核心表：

- **profiles** - 用户资料表
- **verification_codes** - 验证码表
- **test_results** - 测试结果表
- **test_submissions** - 测试提交表
- **orders** - 订单表
- **gift_codes** - 礼品码表
- **gift_code_redemptions** - 礼品码兑换表
- **deepseek_analyses** - AI 分析表
- **user_pricing_info** - 用户定价表
- **system_config** - 系统配置表

详细的表结构和关系请查看 [系统流程图.md](./系统流程图.md)

---

## 🎯 快速测试流程

### 1. 设置管理员（30秒）
```sql
UPDATE profiles SET role = 'admin'::user_role WHERE email = 'admin@test.com';
```

### 2. 生成礼品码（30秒）
- 进入管理后台 → 礼品码管理
- 设置参数 → 生成礼品码

### 3. 测试兑换（1分钟）
- 切换用户 → 完成测试 → 兑换礼品码

### 4. 测试付费（1分钟）
- 创建订单 → 模拟支付 → 验证分析

详细步骤请查看 [快速开始.md](./快速开始.md)

---

## 🔍 常见问题

### Q: 看不到管理后台？
```sql
-- 设置管理员权限
UPDATE profiles SET role = 'admin'::user_role WHERE email = 'your-email@example.com';
```

### Q: 礼品码兑换失败？
```sql
-- 检查并激活礼品码
SELECT * FROM gift_codes WHERE code = 'ABC12345';
UPDATE gift_codes SET is_active = true WHERE code = 'ABC12345';
```

### Q: 支付后没有生成分析？
```sql
-- 手动完成订单
UPDATE orders SET status = 'completed', completed_at = now() WHERE id = '订单ID';
```

更多问题请查看 [部署测试完整指南.md](./部署测试完整指南.md) 的"常见问题"部分

---

## 📈 系统特色

### 科学的评估模型
- 基于 Big Five 人格理论
- 欧几里得距离算法匹配投资风格
- 多维度综合评估

### 智能的价格策略
- 首次购买：¥3.99
- 第二次：¥2.99
- 第三次及以后：¥1.99

### 灵活的礼品码系统
- 支持单次/多次使用
- 可设置有效期
- 实时使用统计
- 激活/停用控制

### 完善的管理后台
- 实时数据统计
- 用户行为分析
- 订单管理
- 礼品码管理

---

## 🎨 设计风格

采用现代化的黑绿配色方案（受 Spotify 启发）：
- 主色：黑色 (#000000)
- 强调色：Spotify 绿 (#1DB954)
- 次要色：深灰 (#181818)、浅灰 (#B3B3B3)
- 错误色：红色 (#E91429)

---

## 📝 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 2 空格缩进

### 组件规范
- 使用函数式组件
- 使用 React Hooks
- 优先使用 shadcn/ui 组件
- 遵循原子设计原则

### 命名规范
- 组件：PascalCase
- 函数：camelCase
- 常量：UPPER_SNAKE_CASE
- 文件：kebab-case 或 PascalCase

---

## 🚢 部署

### 前端部署
推荐使用：
- Vercel
- Netlify
- Cloudflare Pages

### 数据库
- Supabase（已配置）

### 环境变量
确保在部署平台设置以下环境变量：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_ID`
- `VITE_API_ENV`

---

## 📞 技术支持

### 查看日志
- 浏览器控制台（F12）
- Supabase Dashboard → Logs

### 数据库管理
- Supabase Dashboard → SQL Editor
- 执行查询和管理数据

### 文档资源
- [快速开始](./快速开始.md)
- [完整指南](./部署测试完整指南.md)
- [系统流程](./系统流程图.md)

---

## 📄 项目结构

```
├── README.md                          # 项目说明文档
├── 快速开始.md                         # 5分钟快速测试指南
├── 部署测试完整指南.md                  # 完整部署和测试文档
├── 系统流程图.md                       # 系统架构和流程图
├── TESTING_GUIDE.md                   # 详细功能测试指南
├── docs/                              # 专项文档目录
│   ├── ADMIN_SETUP.md                 # 管理员设置指南
│   └── GIFT_CODE_PAYMENT_TESTING.md   # 礼品码和付费测试
├── supabase/                          # Supabase 配置
│   └── migrations/                    # 数据库迁移文件
├── src/                               # 源代码目录
│   ├── components/                    # 组件目录
│   ├── pages/                         # 页面目录
│   ├── contexts/                      # Context 目录
│   ├── db/                            # 数据库 API
│   ├── types/                         # 类型定义
│   └── utils/                         # 工具函数
└── public/                            # 静态资源
```

---

## 🎉 开始使用

1. **新手用户**：查看 [快速开始.md](./快速开始.md)
2. **详细了解**：查看 [部署测试完整指南.md](./部署测试完整指南.md)
3. **系统架构**：查看 [系统流程图.md](./系统流程图.md)

**祝您使用愉快！** 🚀

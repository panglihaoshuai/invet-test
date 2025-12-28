# 项目业务流程详解

## 一、完整用户流程：从注册到获取报告

### 1.1 用户注册与登录

**当前实现**：
- 用户通过邮箱 + 验证码登录（或邮箱 + 密码）
- 系统在 `users` 表中创建用户记录
- 在 `profiles` 表中创建用户资料（role 默认为 'user'）

**未来迁移到 Supabase Auth 后**：
- 支持邮箱密码登录
- 支持 Google OAuth 登录
- 支持 Apple OAuth 登录
- 用户信息存储在 Supabase Auth 的 `auth.users` 表中

### 1.2 开始测试流程

```
用户登录成功
    ↓
点击"开始测试"按钮
    ↓
选择测试模式（快速/完整）
    ↓
系统创建 test_results 记录
    ↓
生成 testId 并保存到 TestContext
    ↓
导航到第一个测试页面
```

**关键代码位置**：
- `src/pages/HomePage.tsx:49` - 开始测试处理
- `src/pages/TestModeSelectionPage.tsx:29` - 创建测试记录
- `src/db/api.ts:172` - `testResultApi.createTestResult()`

### 1.3 测试执行流程（4个测试）

#### 测试顺序（必须按顺序完成）：

**1. 人格特质测试（Personality Test）**
- 路径：`/test/personality`
- 题目数量：50题
- 评估模型：Big Five（五大人格模型）
- 评估维度：
  - Openness（开放性）
  - Conscientiousness（尽责性）
  - Extraversion（外向性）
  - Agreeableness（宜人性）
  - Neuroticism（神经质）
- 结果存储：`TestContext.personalityScores`

**2. 交易特征测试（Trading Characteristics）**
- 路径：`/test/trading-characteristics`
- 评估内容：
  - 交易频率偏好
  - 偏好投资标的
  - 分析方法偏好
  - 技术分析偏好
  - 决策依据
  - 投资理念
  - 学习方式
  - 组合管理方式
- 结果存储：`TestContext.tradingCharacteristics`

**3. 数学金融能力测试（Math Finance）**
- 路径：`/test/math-finance`
- 题目数量：10题
- 评估内容：
  - 金融数学知识
  - 概率计算
  - 复利计算
  - 风险评估
- 结果存储：`TestContext.mathFinanceScores`
- 计算方式：`percentage = (correct_answers / total_questions) * 100`

**4. 风险偏好测试（Risk Preference）**
- 路径：`/test/risk-preference`
- 评估维度：
  - Risk Tolerance（风险容忍度，1-10分）
  - Investment Horizon（投资期限）
  - Loss Aversion（损失厌恶程度，1-10分）
- 结果存储：`TestContext.riskPreferenceScores`

**测试完成检查**：
- 每个测试页面都会检查前置测试是否完成
- 如果未完成前置测试，会重定向到第一个未完成的测试
- 代码位置：`src/pages/MathFinanceTestPage.tsx:22`、`src/pages/RiskPreferenceTestPage.tsx:22`

### 1.4 测试结果生成

**触发时机**：
- 用户完成所有4个测试后，自动导航到结果页面（`/result`）
- `ResultPage` 组件加载时自动生成报告

**生成流程**：

```
用户完成所有测试
    ↓
导航到 /result 页面
    ↓
ResultPage 组件加载
    ↓
调用 generateReport() 函数
    ↓
1. 使用加权匹配算法匹配投资风格
   - matchInvestmentStyleV2()
   - 输入：personalityScores, mathFinanceScores, riskPreferenceScores
   - 输出：bestMatch（最佳匹配的投资风格）
    ↓
2. 生成各项分析文本
   - generatePersonalityAnalysis() - 人格分析
   - generateTradingCharacteristicsAnalysis() - 交易特征分析
   - generateMathFinanceAnalysis() - 数学金融能力分析
   - generateRiskAnalysis() - 风险偏好分析
   - generateDetailedRecommendations() - 详细建议
    ↓
3. 保存测试结果到本地存储
   - testResultStorage.saveTestResult()
   - 存储到浏览器 IndexedDB
    ↓
4. 显示基础报告
   - 投资风格匹配结果
   - 各项分析内容
   - 个性化建议
```

**关键代码位置**：
- `src/pages/ResultPage.tsx:102` - `generateReport()` 函数
- `src/utils/calculations.ts` - 各种分析生成函数
- `src/utils/weightedMatching.ts` - 投资风格匹配算法

### 1.5 获取 DeepSeek AI 深度分析

**两种获取方式**：

#### 方式一：使用礼品码免费获取

```
用户在结果页面看到"解锁 AI 深度分析"卡片
    ↓
检查用户是否有免费分析次数
   - giftCodeApi.getUserFreeAnalyses()
   - 查询 gift_code_redemptions 表
    ↓
如果没有免费次数，显示"兑换礼品码"按钮
    ↓
用户输入礼品码并点击"兑换"
    ↓
调用 redeemGiftCode() 函数
    ↓
数据库验证礼品码：
   1. 检查礼品码是否存在（gift_codes 表）
   2. 检查是否激活（is_active = true）
   3. 检查是否过期（expires_at > now()）
   4. 检查是否达到最大兑换次数
   5. 检查用户是否已兑换过此码
    ↓
验证通过：
   - 在 gift_code_redemptions 表创建记录
     * user_id: 用户ID
     * gift_code_id: 礼品码ID
     * remaining_analyses: 15（默认）
   - 更新 gift_codes.current_redemptions + 1
    ↓
用户获得 15 次免费分析
    ↓
用户点击"免费获取深度分析"按钮
    ↓
调用 generateAnalysisFree() 函数
    ↓
Edge Function 处理：
   1. 验证用户身份（Supabase Auth）
   2. 检查用户剩余免费次数
      - get_user_free_analyses(user_id)
   3. 扣减一次免费次数
      - consume_free_analysis(user_id)
      - 更新 gift_code_redemptions.remaining_analyses - 1
   4. 创建免费订单（orders 表，status='completed'，amount=0）
   5. 调用 DeepSeek API 生成分析
   6. 保存分析结果到 deepseek_analyses 表
    ↓
返回分析结果并显示
```

**关键代码位置**：
- `src/components/analysis/PurchaseAnalysisCard.tsx:59` - 礼品码兑换
- `src/components/analysis/PurchaseAnalysisCard.tsx:99` - 使用免费分析
- `src/db/giftCodeApi.ts:170` - `redeemGiftCode()` 函数
- `src/db/api.ts:448` - `generateAnalysisFree()` 函数
- `supabase/functions/generate_deepseek_analysis_free/index.ts` - Edge Function

#### 方式二：付费购买（当前已关闭）

```
用户点击"立即购买深度分析"按钮
    ↓
查询用户定价信息
   - adminApi.getCurrentUserPricingInfo()
   - 查询 user_pricing_info 表
    ↓
根据 completed_analyses 确定价格：
   - 0次：¥3.99
   - 1次：¥2.99
   - 2次及以上：¥1.99
    ↓
创建支付会话
   - paymentApi.createCheckoutSession()
   - 创建订单（orders 表，status='pending'）
   - 跳转到 Stripe 支付页面
    ↓
用户完成支付
    ↓
支付回调更新订单状态（status='completed'）
    ↓
调用 generateAnalysis() 函数
    ↓
Edge Function 处理：
   1. 验证用户身份
   2. 验证订单是否已支付
   3. 检查是否已有分析（避免重复生成）
   4. 调用 DeepSeek API 生成分析
   5. 保存分析结果到 deepseek_analyses 表
    ↓
更新用户定价信息（completed_analyses + 1）
    ↓
返回分析结果并显示
```

**关键代码位置**：
- `src/components/analysis/PurchaseAnalysisCard.tsx:124` - 付费购买
- `src/db/api.ts:415` - `generateAnalysis()` 函数
- `supabase/functions/generate_deepseek_analysis/index.ts` - Edge Function

### 1.6 DeepSeek API 调用流程

**API 调用详情**：

```
Edge Function 接收请求
    ↓
构建分析提示词（Prompt）
   - buildDeepSeekPrompt()
   - 包含所有测试数据：
     * 人格特质分数
     * 数学金融能力分数
     * 风险偏好分数
     * 交易特征
     * 投资风格匹配结果
    ↓
调用 DeepSeek API
   - URL: https://api.deepseek.com/v1/chat/completions
   - Model: deepseek-chat
   - Temperature: 0.7
   - Max Tokens: 4000
    ↓
DeepSeek 返回分析内容（1500-2500字）
    ↓
保存到数据库
   - deepseek_analyses 表：
     * user_id
     * test_result_id
     * order_id（付费订单ID或免费订单ID）
     * analysis_content（分析内容）
     * prompt_used（使用的提示词）
     * test_data_summary（测试数据摘要）
    ↓
返回分析结果给前端
```

**分析内容结构**：
1. 投资人格画像（300-400字）
2. 金融知识与能力评估（200-300字）
3. 风险管理分析（300-400字）
4. 投资策略建议（400-600字）
5. 行为偏差预警（200-300字）
6. 长期发展路径（200-300字）

**关键代码位置**：
- `supabase/functions/generate_deepseek_analysis/index.ts:223` - `callDeepSeekAPI()` 函数
- `supabase/functions/generate_deepseek_analysis/index.ts:38` - `buildDeepSeekPrompt()` 函数

### 1.7 报告查看与下载

**基础报告**：
- 在线查看：直接在结果页面显示
- PDF 下载：使用浏览器打印功能（`window.print()`）
- 本地保存：测试结果保存到浏览器 IndexedDB

**DeepSeek 分析报告**：
- 在线查看：在结果页面显示 `DeepSeekAnalysisCard` 组件
- JSON 下载：点击"下载 JSON"按钮，下载分析数据
- 本地保存：点击"保存到本地"按钮，保存到浏览器 IndexedDB

**关键代码位置**：
- `src/pages/ResultPage.tsx:185` - PDF 下载处理
- `src/components/analysis/DeepSeekAnalysisCard.tsx:30` - JSON 下载
- `src/utils/localStorage.ts` - 本地存储工具

## 二、礼品码系统详细流程

### 2.1 管理员生成礼品码

```
管理员登录系统
    ↓
进入管理后台（/admin）
    ↓
导航到"礼品码管理"页面
    ↓
点击"生成礼品码"按钮
    ↓
设置参数：
   - maxRedemptions: 最大兑换次数（默认1）
   - expiresInDays: 有效期天数（可选）
   - freeAnalysesCount: 免费分析次数（默认15）
    ↓
调用 generateGiftCode() 函数
    ↓
生成随机8位礼品码
   - 字符集：ABCDEFGHJKLMNPQRSTUVWXYZ23456789
   - 排除易混淆字符（I、O、0、1）
    ↓
插入到 gift_codes 表：
   - code: 8位随机码
   - max_redemptions: 最大兑换次数
   - free_analyses_count: 15
   - is_active: true
   - expires_at: 过期时间（可选）
   - created_by: 管理员用户ID
    ↓
返回礼品码并显示给管理员
```

**关键代码位置**：
- `src/db/giftCodeApi.ts:8` - `generateGiftCode()` 函数
- `src/pages/AdminDashboard.tsx` - 管理后台界面

### 2.2 用户兑换礼品码

```
用户在结果页面看到"兑换礼品码"选项
    ↓
点击"有礼品码？点击兑换"按钮
    ↓
显示礼品码输入框
    ↓
用户输入礼品码（自动转换为大写）
    ↓
点击"兑换"按钮
    ↓
调用 redeemGiftCode() 函数
    ↓
调用数据库函数 redeem_gift_code(code, user_id)
    ↓
数据库验证流程：
   1. 查询 gift_codes 表
      - WHERE code = UPPER(输入码)
      - AND is_active = true
      - AND (expires_at IS NULL OR expires_at > now())
   2. 检查礼品码是否存在
      - 不存在 → 返回"礼品码无效或已过期"
   3. 检查用户是否已兑换过
      - 查询 gift_code_redemptions 表
      - WHERE gift_code_id = 礼品码ID AND user_id = 用户ID
      - 已兑换 → 返回"您已经使用过此礼品码" + 剩余次数
   4. 检查是否达到最大兑换次数
      - current_redemptions >= max_redemptions
      - 达到 → 返回"此礼品码已达到最大使用次数"
    ↓
验证通过：
   1. 创建兑换记录
      INSERT INTO gift_code_redemptions (
        gift_code_id,
        user_id,
        remaining_analyses  -- 默认15
      )
   2. 更新礼品码统计
      UPDATE gift_codes
      SET current_redemptions = current_redemptions + 1
    ↓
返回成功消息："礼品码兑换成功！您获得15次免费分析"
    ↓
刷新免费分析次数显示
```

**关键代码位置**：
- `src/components/analysis/PurchaseAnalysisCard.tsx:59` - 兑换处理
- `src/db/giftCodeApi.ts:170` - `redeemGiftCode()` 函数
- `supabase/migrations/08_create_gift_code_system.sql:101` - `redeem_gift_code()` 数据库函数

### 2.3 使用免费分析次数

```
用户有免费分析次数（remaining_analyses > 0）
    ↓
在结果页面看到"您有免费分析次数"卡片
    ↓
点击"免费获取深度分析"按钮
    ↓
调用 handleUseFreeAnalysis() 函数
    ↓
调用 deepseekApi.generateAnalysisFree()
    ↓
Edge Function 处理：
   1. 验证用户身份（Supabase Auth token）
   2. 查询用户剩余免费次数
      - get_user_free_analyses(user_id)
      - 查询 gift_code_redemptions 表
      - SUM(remaining_analyses) WHERE user_id = 用户ID
   3. 检查是否有可用次数
      - 没有 → 返回"无可用免费次数"
   4. 扣减一次免费次数
      - consume_free_analysis(user_id)
      - 找到 oldest redemption with remaining_analyses > 0
      - UPDATE remaining_analyses = remaining_analyses - 1
   5. 创建免费订单
      INSERT INTO orders (
        user_id,
        test_result_id,
        items: [{ name: 'DeepSeek Free Analysis', price: 0 }],
        total_amount: 0,
        status: 'completed',
        metadata: { source: 'gift_code' }
      )
   6. 调用 DeepSeek API 生成分析
   7. 保存分析结果到 deepseek_analyses 表
    ↓
返回分析结果
    ↓
前端显示分析内容
```

**关键代码位置**：
- `src/components/analysis/PurchaseAnalysisCard.tsx:99` - 使用免费分析
- `src/db/api.ts:448` - `generateAnalysisFree()` 函数
- `supabase/functions/generate_deepseek_analysis_free/index.ts:67` - 扣减逻辑
- `supabase/migrations/08_create_gift_code_system.sql:185` - `consume_free_analysis()` 数据库函数

### 2.4 免费次数管理机制

**次数存储**：
- 存储在 `gift_code_redemptions` 表的 `remaining_analyses` 字段
- 每个兑换记录独立管理次数
- 使用 FIFO（先进先出）策略扣减次数

**次数查询**：
```sql
SELECT COALESCE(SUM(remaining_analyses), 0)
FROM gift_code_redemptions
WHERE user_id = 用户ID
  AND remaining_analyses > 0
```

**次数扣减**：
```sql
-- 找到最早兑换且还有剩余次数的记录
SELECT * FROM gift_code_redemptions
WHERE user_id = 用户ID
  AND remaining_analyses > 0
ORDER BY redeemed_at ASC
LIMIT 1;

-- 扣减一次
UPDATE gift_code_redemptions
SET remaining_analyses = remaining_analyses - 1
WHERE id = 找到的记录ID
```

**重要特性**：
- ✅ 次数跟随用户账户（关联到 `user_id`）
- ✅ 用户退出登录后次数仍然保留
- ✅ 支持多次兑换礼品码，次数累加
- ✅ 每次使用扣减一次，直到为0

## 三、数据存储与关联关系

### 3.1 核心数据表

**users / auth.users**（用户表）
- `id`: 用户唯一标识（UUID）
- `email`: 用户邮箱
- `created_at`: 创建时间

**profiles**（用户资料表）
- `id`: 关联到 `users.id` 或 `auth.users.id`
- `email`: 用户邮箱
- `role`: 用户角色（'user' 或 'admin'）

**test_results**（测试结果表）
- `id`: 测试结果ID（UUID）
- `user_id`: 关联到 `users.id`
- `personality_scores`: 人格分数（JSONB）
- `math_finance_score`: 数学金融分数
- `risk_preference_score`: 风险偏好分数
- `investment_style`: 推荐投资风格
- `completed_at`: 完成时间

**gift_codes**（礼品码表）
- `id`: 礼品码ID（UUID）
- `code`: 礼品码字符串（8位，UNIQUE）
- `max_redemptions`: 最大兑换次数
- `current_redemptions`: 当前已兑换次数
- `free_analyses_count`: 每次兑换获得的免费次数（默认15）
- `is_active`: 是否激活
- `expires_at`: 过期时间
- `created_by`: 创建者ID（关联到 `profiles.id`）

**gift_code_redemptions**（礼品码兑换记录表）
- `id`: 兑换记录ID（UUID）
- `gift_code_id`: 关联到 `gift_codes.id`
- `user_id`: 关联到 `users.id` 或 `profiles.id`
- `redeemed_at`: 兑换时间
- `remaining_analyses`: 剩余免费分析次数（默认15）

**orders**（订单表）
- `id`: 订单ID（UUID）
- `user_id`: 关联到 `users.id`
- `test_result_id`: 关联到 `test_results.id`
- `amount`: 订单金额（分）
- `status`: 订单状态（'pending' / 'completed' / 'failed'）
- `items`: 订单项（JSONB）
- `metadata`: 元数据（JSONB，如 `{ source: 'gift_code' }`）

**deepseek_analyses**（DeepSeek 分析表）
- `id`: 分析ID（UUID）
- `user_id`: 关联到 `users.id`
- `test_result_id`: 关联到 `test_results.id`
- `order_id`: 关联到 `orders.id`（付费订单或免费订单）
- `analysis_content`: 分析内容（文本，1500-2500字）
- `prompt_used`: 使用的提示词
- `test_data_summary`: 测试数据摘要（JSONB）
- `created_at`: 创建时间

### 3.2 数据关联关系图

```
auth.users / users
    │
    ├── profiles (1:1)
    │       │
    │       └── gift_codes.created_by (1:N)
    │
    ├── test_results (1:N)
    │       │
    │       └── deepseek_analyses.test_result_id (1:N)
    │
    ├── orders (1:N)
    │       │
    │       └── deepseek_analyses.order_id (1:N)
    │
    └── gift_code_redemptions (1:N)
            │
            └── gift_codes (N:1)
```

### 3.3 数据流示例

**完整流程数据变化**：

1. **用户注册**：
   - `auth.users`: 插入新用户记录
   - `profiles`: 插入用户资料（role='user'）

2. **开始测试**：
   - `test_results`: 创建测试记录（id=testId）

3. **完成测试**：
   - `test_results`: 更新测试数据（personality_scores, math_finance_score 等）
   - 本地存储：保存到 IndexedDB

4. **兑换礼品码**：
   - `gift_code_redemptions`: 插入兑换记录（remaining_analyses=15）
   - `gift_codes`: 更新 current_redemptions + 1

5. **使用免费分析**：
   - `gift_code_redemptions`: 更新 remaining_analyses - 1
   - `orders`: 创建免费订单（amount=0, status='completed'）
   - `deepseek_analyses`: 插入分析结果

## 四、关键业务逻辑说明

### 4.1 测试顺序控制

- 每个测试页面都会检查前置测试是否完成
- 如果未完成，会重定向到第一个未完成的测试
- 测试进度保存在 `TestContext` 中

### 4.2 投资风格匹配算法

- 使用加权欧几里得距离算法
- 输入：人格分数、数学金融能力、风险偏好
- 输出：最佳匹配的投资风格（如"稳健型"、"激进型"等）
- 代码位置：`src/utils/weightedMatching.ts`

### 4.3 礼品码唯一性保证

- 数据库层面：`gift_codes.code` 字段有 UNIQUE 约束
- 生成时检查：如果生成的码已存在，重新生成
- 最大重试次数：10次

### 4.4 免费次数扣减策略

- FIFO（先进先出）：优先扣减最早兑换的礼品码次数
- 每次使用扣减1次
- 次数为0后不再扣减，但记录保留

### 4.5 分析结果缓存

- 如果同一测试结果已有分析，直接返回缓存结果
- 避免重复调用 DeepSeek API
- 检查条件：`test_result_id` + `order_id` 唯一

## 五、当前问题与修复计划

### 5.1 DeepSeek API 调用失败问题

**问题原因**：
- Edge Functions 使用 `supabase.auth.getUser(token)` 验证 token
- 但当前系统使用自定义 JWT token（通过 `login-password` Edge Function 生成）
- 两者不兼容，导致认证失败

**修复方案**：
- 迁移到 Supabase Auth
- 使用 Supabase Auth 的标准 token
- Edge Functions 可以正确验证 token

### 5.2 认证系统迁移

**当前状态**：
- 自定义认证系统（`users` 表 + bcrypt + 自定义 JWT）
- Edge Functions：`login-password`, `verify-code-and-login`, `verify-token`

**目标状态**：
- Supabase Auth（支持邮箱、Google、Apple）
- 用户信息存储在 `auth.users`
- 所有 API 使用 Supabase Auth session

### 5.3 数据迁移策略

- 将现有 `users` 表数据迁移到 `auth.users`
- 更新所有外键关联
- 确保礼品码兑换记录、测试结果等数据不丢失

## 六、测试建议

### 6.1 完整流程测试

1. 注册/登录 → 完成4个测试 → 查看基础报告
2. 兑换礼品码 → 使用免费分析 → 查看 DeepSeek 分析
3. 多次兑换礼品码 → 验证次数累加
4. 使用免费分析 → 验证次数扣减
5. 退出登录 → 重新登录 → 验证次数保留

### 6.2 边界情况测试

1. 礼品码过期 → 验证无法兑换
2. 礼品码达到最大兑换次数 → 验证无法兑换
3. 用户重复兑换同一礼品码 → 验证提示已兑换
4. 免费次数为0 → 验证无法使用免费分析
5. 测试数据不完整 → 验证无法生成报告

---

**文档版本**：1.0  
**最后更新**：2024年  
**维护者**：开发团队


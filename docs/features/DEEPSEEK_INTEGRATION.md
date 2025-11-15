# DeepSeek AI 深度分析集成指南

## 功能概述

本系统已成功集成 DeepSeek AI 深度分析功能，用户完成投资心理测评后，可以支付 ¥3.99 购买由 DeepSeek AI 生成的专业投资心理分析报告。

## 核心功能

### 1. 支付流程
- 使用 Stripe 作为支付网关
- 支持多种支付方式（Visa、Mastercard、支付宝等）
- 价格：¥3.99（限时优惠，原价 ¥19.99）
- 安全的支付会话管理

### 2. DeepSeek AI 分析
分析报告包含以下内容（1500-2500字）：

#### a. 投资人格画像（300-400字）
- 基于 Big Five 人格模型的深度分析
- 解释各项特质如何影响投资决策
- 指出性格优势和潜在风险点

#### b. 金融知识与能力评估（200-300字）
- 评估金融数学知识水平
- 指出知识强项和需要提升的领域
- 提供具体的学习建议

#### c. 风险管理分析（300-400字）
- 深入分析风险容忍度和损失厌恶特征
- 结合人格特质解释风险偏好的心理根源
- 提供个性化的风险管理策略

#### d. 投资策略建议（400-600字）
- 详细的投资策略建议
- 包括资产配置、交易频率、持仓周期等
- 提供 3-5 个具体的可执行建议

#### e. 行为偏差预警（200-300字）
- 指出可能存在的行为偏差
- 提供具体的预防和纠正方法

#### f. 长期发展路径（200-300字）
- 投资能力提升的长期规划
- 包括知识学习、实践经验、心态调整等方面

## 技术架构

### 数据库表结构

#### orders 表
存储支付订单信息：
- `id`: 订单ID
- `user_id`: 用户ID
- `items`: 订单项（JSON）
- `total_amount`: 总金额（分）
- `currency`: 货币类型
- `status`: 订单状态（pending/completed/cancelled/refunded）
- `stripe_session_id`: Stripe会话ID
- `stripe_payment_intent_id`: Stripe支付意图ID
- `test_result_id`: 关联的测试结果ID
- `completed_at`: 完成时间

#### deepseek_analyses 表
存储 DeepSeek AI 分析结果：
- `id`: 分析ID
- `user_id`: 用户ID
- `test_result_id`: 测试结果ID
- `order_id`: 订单ID
- `analysis_content`: 分析内容（文本）
- `prompt_used`: 使用的提示词
- `test_data_summary`: 测试数据摘要（JSON）

### Edge Functions

#### 1. create_stripe_checkout
创建 Stripe 支付会话
- 输入：商品信息、测试结果ID
- 输出：支付URL、会话ID、订单ID
- 功能：创建订单记录并生成 Stripe 支付链接

#### 2. verify_stripe_payment
验证支付状态
- 输入：Stripe 会话ID
- 输出：支付验证结果
- 功能：验证支付是否成功并更新订单状态

#### 3. generate_deepseek_analysis
生成 DeepSeek AI 分析
- 输入：测试结果ID、订单ID
- 输出：AI 生成的分析报告
- 功能：调用 DeepSeek API 生成专业分析并保存到数据库

### 前端组件

#### PurchaseAnalysisCard
购买分析卡片组件
- 显示功能列表和价格信息
- 处理支付流程
- 在新窗口打开 Stripe 支付页面

#### DeepSeekAnalysisCard
分析展示卡片组件
- 格式化显示 AI 生成的分析内容
- 支持 Markdown 格式渲染
- 显示生成时间和元数据

#### PaymentSuccessPage
支付成功页面
- 验证支付状态
- 显示支付信息
- 引导用户查看分析报告

## 配置步骤

### 1. 配置 Stripe

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. 获取 Secret Key（以 `sk_test_` 或 `sk_live_` 开头）
3. 在 `.env` 文件中取消注释并填入：
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   ```

### 2. 配置 DeepSeek API

1. 访问 [DeepSeek Platform](https://platform.deepseek.com)
2. 注册账号并获取 API Key
3. 在 `.env` 文件中取消注释并填入：
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

### 3. 配置 Supabase Secrets

由于 Edge Functions 需要访问这些密钥，需要在 Supabase 中配置环境变量：

```bash
# 使用 Supabase CLI 或通过 Dashboard 配置
STRIPE_SECRET_KEY=your_stripe_secret_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

**注意**：Edge Functions 已经部署，但需要配置上述密钥才能正常工作。

## 使用流程

### 用户端流程

1. **完成测评**
   - 用户完成所有测试（人格、数学金融、风险偏好、交易特征）
   - 系统生成基础测评报告

2. **查看购买选项**
   - 在结果页面看到 "解锁 AI 深度分析" 卡片
   - 显示功能列表和价格信息

3. **支付流程**
   - 点击 "立即购买深度分析" 按钮
   - 在新窗口打开 Stripe 支付页面
   - 完成支付（支持多种支付方式）

4. **查看分析**
   - 支付成功后自动跳转到成功页面
   - 系统自动生成 DeepSeek AI 分析
   - 在测试结果页面查看完整的专业分析报告

### 技术流程

1. **创建支付会话**
   ```typescript
   const result = await paymentApi.createCheckoutSession(items, testResultId);
   // 返回 Stripe 支付 URL
   ```

2. **验证支付**
   ```typescript
   const paymentResult = await paymentApi.verifyPayment(sessionId);
   // 验证支付状态并更新订单
   ```

3. **生成分析**
   ```typescript
   const analysis = await deepseekApi.generateAnalysis(testResultId, orderId);
   // 调用 DeepSeek API 生成分析
   ```

4. **显示分析**
   ```typescript
   const analysis = await deepseekApi.getAnalysisByTestResult(testResultId);
   // 获取已生成的分析报告
   ```

## API 接口说明

### Payment API

```typescript
// 创建支付会话
paymentApi.createCheckoutSession(
  items: OrderItem[],
  testResultId: string
): Promise<{ url: string; sessionId: string; orderId: string } | null>

// 验证支付
paymentApi.verifyPayment(
  sessionId: string
): Promise<any>

// 获取用户订单
paymentApi.getUserOrders(
  userId: string
): Promise<Order[]>

// 根据测试结果获取已完成订单
paymentApi.getCompletedOrderByTestResult(
  testResultId: string
): Promise<Order | null>
```

### DeepSeek API

```typescript
// 生成分析
deepseekApi.generateAnalysis(
  testResultId: string,
  orderId: string
): Promise<DeepSeekAnalysis | null>

// 获取分析
deepseekApi.getAnalysisByTestResult(
  testResultId: string
): Promise<DeepSeekAnalysis | null>

// 获取用户所有分析
deepseekApi.getUserAnalyses(
  userId: string
): Promise<DeepSeekAnalysis[]>
```

## 安全性

### 数据安全
- 所有支付信息通过 Stripe 处理，不存储敏感支付信息
- API 密钥存储在环境变量中，不暴露给前端
- 使用 Supabase RLS 策略保护数据访问

### 权限控制
- 只有已登录用户可以购买分析
- 用户只能查看自己的订单和分析
- Edge Functions 使用 JWT 验证用户身份

### 支付安全
- 使用 Stripe 的安全支付流程
- 支持 3D Secure 验证
- 订单状态原子性更新，防止重复支付

## 测试建议

### 测试环境配置
1. 使用 Stripe 测试密钥（`sk_test_`）
2. 使用测试卡号：`4242 4242 4242 4242`
3. 任意未来日期和 CVC

### 测试场景
1. **正常购买流程**
   - 完成测评 → 点击购买 → 完成支付 → 查看分析

2. **重复购买检测**
   - 已购买用户不应再看到购买按钮
   - 应直接显示分析报告

3. **支付失败处理**
   - 取消支付后返回结果页面
   - 订单状态保持为 pending

4. **分析缓存**
   - 已生成的分析不应重复调用 API
   - 从数据库直接读取

## 故障排查

### 常见问题

#### 1. 支付会话创建失败
- 检查 STRIPE_SECRET_KEY 是否正确配置
- 确认 Stripe 账户状态正常
- 查看 Edge Function 日志

#### 2. DeepSeek API 调用失败
- 检查 DEEPSEEK_API_KEY 是否正确配置
- 确认 API 配额是否充足
- 查看 Edge Function 日志

#### 3. 分析未显示
- 检查订单状态是否为 completed
- 确认 DeepSeek 分析是否已生成
- 查看浏览器控制台错误

### 日志查看
```bash
# 查看 Edge Function 日志
supabase functions logs create_stripe_checkout
supabase functions logs verify_stripe_payment
supabase functions logs generate_deepseek_analysis
```

## 未来优化建议

1. **支付方式扩展**
   - 添加微信支付、支付宝直连
   - 支持更多货币类型

2. **分析功能增强**
   - 支持分析报告导出（PDF）
   - 添加图表可视化
   - 支持分析报告分享

3. **用户体验优化**
   - 添加支付进度提示
   - 优化分析生成等待体验
   - 添加分析预览功能

4. **运营功能**
   - 添加优惠券系统
   - 支持批量购买折扣
   - 添加推荐奖励机制

## 相关文件

### 数据库
- `supabase/migrations/03_create_payment_and_deepseek_tables.sql`

### Edge Functions
- `supabase/functions/create_stripe_checkout/index.ts`
- `supabase/functions/verify_stripe_payment/index.ts`
- `supabase/functions/generate_deepseek_analysis/index.ts`

### 前端组件
- `src/components/analysis/PurchaseAnalysisCard.tsx`
- `src/components/analysis/DeepSeekAnalysisCard.tsx`
- `src/pages/PaymentSuccessPage.tsx`
- `src/pages/ResultPage.tsx`

### API
- `src/db/api.ts` (paymentApi, deepseekApi)

### 类型定义
- `src/types/types.ts` (Order, DeepSeekAnalysis, OrderItem)

## 联系支持

如有问题或需要帮助，请：
1. 查看本文档的故障排查部分
2. 检查 Edge Function 日志
3. 查看浏览器控制台错误信息

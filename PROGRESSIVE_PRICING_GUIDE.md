# 阶梯定价系统指南

## 概述

本系统实现了智能阶梯定价功能，根据用户的购买历史自动调整价格，鼓励用户持续使用服务。

## 定价策略

### 价格阶梯

| 购买次数 | 价格 | 折扣 | 说明 |
|---------|------|------|------|
| 第 1 次 | ¥3.99 | 80% OFF | 首次体验价 |
| 第 2 次 | ¥2.99 | 85% OFF | 回购优惠 |
| 第 3 次及以上 | ¥0.99 | 95% OFF | 忠实用户价 |

### 定价逻辑

```
首次购买: ¥3.99 (399 分)
  ↓
第二次购买: ¥2.99 (299 分) - 节省 ¥1.00
  ↓
后续购买: ¥0.99 (99 分) - 节省 ¥3.00
```

## 技术实现

### 1. 数据库函数

系统使用 PostgreSQL 函数动态计算价格：

```sql
CREATE OR REPLACE FUNCTION get_user_analysis_price(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed_count integer;
  price integer;
BEGIN
  -- 统计用户已完成的分析订单数量
  SELECT COUNT(*)::integer INTO completed_count
  FROM orders
  WHERE user_id = p_user_id 
    AND status = 'completed'
    AND items::jsonb @> '[{"type": "deepseek_analysis"}]'::jsonb;

  -- 根据购买次数计算价格
  IF completed_count = 0 THEN
    price := 399; -- ¥3.99
  ELSIF completed_count = 1 THEN
    price := 299; -- ¥2.99
  ELSE
    price := 99;  -- ¥0.99
  END IF;

  RETURN price;
END;
$$;
```

### 2. 用户定价信息视图

```sql
CREATE OR REPLACE VIEW user_pricing_info AS
SELECT 
  p.id as user_id,
  p.email,
  COUNT(o.id) FILTER (
    WHERE o.status = 'completed' 
    AND o.items::jsonb @> '[{"type": "deepseek_analysis"}]'::jsonb
  ) as completed_analyses,
  CASE 
    WHEN COUNT(o.id) FILTER (...) = 0 THEN 399
    WHEN COUNT(o.id) FILTER (...) = 1 THEN 299
    ELSE 99
  END as next_price
FROM profiles p
LEFT JOIN orders o ON o.user_id = p.id
GROUP BY p.id, p.email;
```

### 3. API 接口

#### 获取用户价格

```typescript
// 获取当前用户的分析价格
const price = await adminApi.getUserAnalysisPrice();
// 返回: 399, 299, 或 99 (分)

// 获取指定用户的价格
const price = await adminApi.getUserAnalysisPrice(userId);
```

#### 获取定价信息

```typescript
// 获取完整的定价信息
const pricingInfo = await adminApi.getCurrentUserPricingInfo();
// 返回: {
//   user_id: "uuid",
//   email: "user@example.com",
//   completed_analyses: 2,
//   next_price: 99
// }
```

## 前端展示

### 购买卡片动态显示

系统会根据用户的购买历史动态显示价格和优惠信息：

#### 首次购买用户
```
┌─────────────────────────────────┐
│ 解锁 AI 深度分析      [限时优惠] │
├─────────────────────────────────┤
│ ¥3.99  一次性付费               │
│                    原价 ¥19.99  │
│                  限时 80% OFF   │
│                                 │
│ [立即购买深度分析]              │
└─────────────────────────────────┘
```

#### 第二次购买用户
```
┌─────────────────────────────────┐
│ 解锁 AI 深度分析      [限时优惠] │
├─────────────────────────────────┤
│ ¥2.99  一次性付费               │
│              [第二次购买]       │
│                  再降 ¥1.00     │
│                                 │
│ 🎉 老用户专享优惠               │
│ 第二次购买享受优惠价，          │
│ 下次更低至 ¥0.99！              │
│                                 │
│ [立即购买深度分析]              │
└─────────────────────────────────┘
```

#### 老用户（3次及以上）
```
┌─────────────────────────────────┐
│ 解锁 AI 深度分析      [限时优惠] │
├─────────────────────────────────┤
│ ¥0.99  一次性付费               │
│            [老用户优惠]         │
│                    最低价格     │
│                                 │
│ 🎉 老用户专享优惠               │
│ 您已享受最低价格，              │
│ 感谢您的持续支持！              │
│                                 │
│ [立即购买深度分析]              │
└─────────────────────────────────┘
```

## 管理后台统计

### 阶梯定价统计面板

管理员可以在后台查看各价格段的销售情况：

```
┌─────────────────────────────────────────────────┐
│ 阶梯定价统计                                     │
│ 用户购买次数分布                                 │
├─────────────────────────────────────────────────┤
│ 首次购买 (¥3.99)        [42]                    │
│ 收入: ¥167.58                                   │
│                                                 │
│ 第二次购买 (¥2.99)      [28]                    │
│ 收入: ¥83.72                                    │
│                                                 │
│ 老用户优惠 (¥0.99)      [156]                   │
│ 收入: ¥154.44                                   │
└─────────────────────────────────────────────────┘
```

### 统计数据

管理员可以查看：
- 各价格段的订单数量
- 各价格段的总收入
- 用户留存率（第二次购买率）
- 忠诚用户比例（3次及以上购买）

## 业务分析

### 关键指标

#### 1. 首购转化率
```sql
SELECT 
  COUNT(DISTINCT user_id) FILTER (WHERE total_amount = 399) * 100.0 / 
  COUNT(DISTINCT user_id) as first_purchase_rate
FROM orders
WHERE status = 'completed';
```

#### 2. 复购率
```sql
SELECT 
  COUNT(DISTINCT user_id) FILTER (WHERE purchase_count >= 2) * 100.0 / 
  COUNT(DISTINCT user_id) as repurchase_rate
FROM (
  SELECT user_id, COUNT(*) as purchase_count
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
) subquery;
```

#### 3. 忠诚用户比例
```sql
SELECT 
  COUNT(DISTINCT user_id) FILTER (WHERE purchase_count >= 3) * 100.0 / 
  COUNT(DISTINCT user_id) as loyal_user_rate
FROM (
  SELECT user_id, COUNT(*) as purchase_count
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
) subquery;
```

### 收入分析

#### 按价格段统计收入
```sql
SELECT 
  CASE 
    WHEN total_amount = 399 THEN '首次购买'
    WHEN total_amount = 299 THEN '第二次购买'
    WHEN total_amount = 99 THEN '老用户优惠'
  END as price_tier,
  COUNT(*) as order_count,
  SUM(total_amount) / 100.0 as total_revenue
FROM orders
WHERE status = 'completed'
GROUP BY total_amount
ORDER BY total_amount DESC;
```

## 用户体验优化

### 1. 价格透明

- ✅ 清晰显示当前价格
- ✅ 明确标注优惠幅度
- ✅ 提示下次购买价格

### 2. 激励机制

- ✅ 首次购买：强调性价比（80% OFF）
- ✅ 第二次购买：展示节省金额
- ✅ 老用户：感谢持续支持

### 3. 心理定价

- 使用 .99 结尾增强吸引力
- 阶梯式降价创造期待感
- 最低价锁定忠诚用户

## 调整定价策略

### 修改价格

如需调整价格，修改数据库函数：

```sql
CREATE OR REPLACE FUNCTION get_user_analysis_price(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed_count integer;
  price integer;
BEGIN
  SELECT COUNT(*)::integer INTO completed_count
  FROM orders
  WHERE user_id = p_user_id 
    AND status = 'completed'
    AND items::jsonb @> '[{"type": "deepseek_analysis"}]'::jsonb;

  -- 修改这里的价格
  IF completed_count = 0 THEN
    price := 499; -- 改为 ¥4.99
  ELSIF completed_count = 1 THEN
    price := 399; -- 改为 ¥3.99
  ELSIF completed_count = 2 THEN
    price := 299; -- 改为 ¥2.99
  ELSE
    price := 199; -- 改为 ¥1.99
  END IF;

  RETURN price;
END;
$$;
```

### 添加更多价格阶梯

可以根据需要添加更多阶梯：

```sql
IF completed_count = 0 THEN
  price := 399;  -- 第1次
ELSIF completed_count = 1 THEN
  price := 299;  -- 第2次
ELSIF completed_count = 2 THEN
  price := 199;  -- 第3次
ELSIF completed_count = 3 THEN
  price := 149;  -- 第4次
ELSE
  price := 99;   -- 第5次及以上
END IF;
```

## 测试定价功能

### 1. 测试首次购买

```typescript
// 新用户应该看到 ¥3.99
const pricingInfo = await adminApi.getCurrentUserPricingInfo();
console.log(pricingInfo);
// { completed_analyses: 0, next_price: 399 }
```

### 2. 模拟完成订单

```sql
-- 创建测试订单
INSERT INTO orders (user_id, total_amount, status, items)
VALUES (
  'user-uuid',
  399,
  'completed',
  '[{"type": "deepseek_analysis", "name": "AI分析报告"}]'::jsonb
);
```

### 3. 验证价格变化

```typescript
// 完成一次购买后应该看到 ¥2.99
const pricingInfo = await adminApi.getCurrentUserPricingInfo();
console.log(pricingInfo);
// { completed_analyses: 1, next_price: 299 }
```

## 常见问题

### Q: 价格什么时候更新？

**A:** 价格在每次页面加载时实时计算，基于用户的 `completed` 状态订单数量。

### Q: 如果订单被退款，价格会恢复吗？

**A:** 当前实现只统计 `status = 'completed'` 的订单。如果订单状态改为其他值（如 `refunded`），下次计算价格时不会计入。

### Q: 可以为特定用户设置固定价格吗？

**A:** 可以。有两种方式：

1. **修改函数添加特殊用户判断**
```sql
IF p_user_id = 'special-user-uuid' THEN
  RETURN 99; -- 固定价格
END IF;
```

2. **创建价格覆盖表**
```sql
CREATE TABLE price_overrides (
  user_id uuid PRIMARY KEY,
  fixed_price integer NOT NULL
);
```

### Q: 如何查看某个用户的购买历史？

**A:** 查询数据库：

```sql
SELECT 
  o.id,
  o.total_amount / 100.0 as price,
  o.status,
  o.created_at,
  o.completed_at
FROM orders o
WHERE o.user_id = 'user-uuid'
  AND o.items::jsonb @> '[{"type": "deepseek_analysis"}]'::jsonb
ORDER BY o.created_at DESC;
```

## 最佳实践

### 1. 监控转化率

定期检查各阶段的转化情况：
- 首购转化率是否健康？
- 复购率是否达到预期？
- 价格调整对转化的影响？

### 2. A/B 测试

可以为不同用户群体测试不同的价格策略：
- 对照组：标准阶梯定价
- 实验组：调整后的价格

### 3. 用户反馈

收集用户对定价的反馈：
- 价格是否合理？
- 优惠力度是否吸引人？
- 是否愿意推荐给朋友？

### 4. 数据驱动决策

基于数据调整策略：
- 分析不同价格段的利润率
- 评估用户生命周期价值（LTV）
- 优化价格以最大化长期收益

## 技术支持

如需帮助，请检查：

1. **价格计算函数**
```sql
SELECT get_user_analysis_price('user-uuid');
```

2. **用户购买记录**
```sql
SELECT * FROM user_pricing_info WHERE user_id = 'user-uuid';
```

3. **订单状态**
```sql
SELECT * FROM orders WHERE user_id = 'user-uuid' ORDER BY created_at DESC;
```

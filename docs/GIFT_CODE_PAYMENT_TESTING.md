# 礼品码和付费功能测试指南（简化版）

## 🚀 快速开始

### 第一步：成为管理员

1. 登录系统（使用任意邮箱，例如：admin@test.com）
2. 在 Supabase SQL Editor 执行：

```sql
-- 将 'admin@test.com' 替换为您的邮箱
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email = 'admin@test.com';
```

3. 刷新页面，点击右上角"管理后台"

---

## 🎁 测试礼品码功能

### A. 生成礼品码（管理员）

1. 进入"管理后台" → "礼品码管理"
2. 设置参数：
   - 最大兑换次数：`1`（单次使用）或 `10`（多次使用）
   - 有效期：留空（永久）或 `7`（7天后过期）
3. 点击"生成礼品码"
4. 复制生成的礼品码（例如：`ABC12345`）

### B. 兑换礼品码（普通用户）

1. 使用另一个邮箱登录（例如：user@test.com）
2. 完成所有测试：
   - ✅ 人格测试
   - ✅ 交易特征测试
   - ✅ 数学金融测试
   - ✅ 风险偏好测试
3. 在结果页面，找到"购买 DeepSeek AI 分析"卡片
4. 点击"有礼品码？点击兑换"
5. 输入礼品码，点击"兑换"
6. 看到"🎁 您有 1 次免费分析机会"

### C. 使用免费次数

1. 点击"使用免费次数"按钮
2. 系统自动生成 AI 分析报告
3. 查看完整的分析内容

---

## 💳 测试付费功能

### A. 查看价格（递减策略）

- 首次购买：¥3.99
- 第二次：¥2.99
- 第三次及以后：¥1.99

### B. 创建订单

1. 完成所有测试
2. 在结果页面点击"立即购买"
3. 系统创建支付订单

### C. 模拟支付成功

**方法1：直接更新数据库**

```sql
-- 查看最新订单
SELECT id, status, amount, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 1;

-- 标记为已完成（替换订单ID）
UPDATE orders 
SET status = 'completed', 
    completed_at = now() 
WHERE id = '订单ID';
```

**方法2：访问支付成功页面**

直接访问：`/payment-success?session_id=订单ID`

### D. 验证结果

支付成功后应该：
- ✅ 显示支付成功提示
- ✅ 自动生成 AI 分析报告
- ✅ 显示完整分析内容
- ✅ 下次购买价格降低

---

## 📊 管理后台功能

### 概览
- 查看总用户数、测试次数、订单数、收入
- 查看礼品码统计

### 用户管理
- 查看所有用户
- 查看用户测试历史
- 查看用户订单历史

### 订单管理
- 查看所有订单
- 筛选订单状态
- 查看订单详情

### 礼品码管理
- 生成新礼品码
- 查看礼品码列表
- 激活/停用礼品码
- 查看使用情况

---

## 🔍 常用数据库查询

### 查看所有礼品码
```sql
SELECT 
  code,
  is_active,
  max_redemptions,
  current_redemptions,
  expires_at,
  created_at
FROM gift_codes 
ORDER BY created_at DESC;
```

### 查看礼品码兑换记录
```sql
SELECT 
  gc.code,
  p.email as user_email,
  gcr.remaining_uses,
  gcr.redeemed_at
FROM gift_code_redemptions gcr
JOIN gift_codes gc ON gcr.gift_code_id = gc.id
JOIN profiles p ON gcr.user_id = p.id
ORDER BY gcr.redeemed_at DESC;
```

### 查看用户的免费次数
```sql
SELECT 
  p.email,
  SUM(gcr.remaining_uses) as free_analyses
FROM gift_code_redemptions gcr
JOIN profiles p ON gcr.user_id = p.id
GROUP BY p.email
HAVING SUM(gcr.remaining_uses) > 0;
```

### 查看所有订单
```sql
SELECT 
  p.email,
  o.amount,
  o.status,
  o.created_at,
  o.completed_at
FROM orders o
JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC;
```

### 查看用户定价信息
```sql
SELECT 
  p.email,
  upi.completed_analyses,
  upi.next_price / 100.0 as next_price_yuan
FROM user_pricing_info upi
JOIN profiles p ON upi.user_id = p.id
ORDER BY upi.completed_analyses DESC;
```

---

## 🧪 完整测试流程

### 场景1：礼品码兑换流程

```
1. 管理员登录 → 生成礼品码（ABC12345）
2. 普通用户登录 → 完成测试
3. 兑换礼品码 → 获得1次免费机会
4. 使用免费次数 → 生成AI分析
5. 管理员查看 → 礼品码已使用1次
```

### 场景2：付费购买流程

```
1. 用户登录 → 完成测试
2. 查看价格 → ¥3.99（首次）
3. 点击购买 → 创建订单
4. 模拟支付 → 订单完成
5. 自动生成 → AI分析报告
6. 再次测试 → 价格降为¥2.99
```

### 场景3：混合使用流程

```
1. 用户首次使用礼品码 → 免费获得分析
2. 第二次完成测试 → 付费¥3.99
3. 第三次完成测试 → 付费¥2.99
4. 第四次完成测试 → 付费¥1.99
5. 再次兑换礼品码 → 免费获得分析
```

---

## 🛠️ 故障排查

### 问题1：礼品码兑换失败

**可能原因：**
- 礼品码输入错误（区分大小写）
- 礼品码已过期
- 礼品码已达到最大使用次数
- 礼品码已被停用

**解决方法：**
```sql
-- 检查礼品码状态
SELECT * FROM gift_codes WHERE code = 'ABC12345';

-- 激活礼品码
UPDATE gift_codes 
SET is_active = true 
WHERE code = 'ABC12345';

-- 增加使用次数
UPDATE gift_codes 
SET max_redemptions = max_redemptions + 10 
WHERE code = 'ABC12345';
```

### 问题2：支付后没有生成分析

**检查步骤：**
1. 确认订单状态为 'completed'
2. 查看浏览器控制台错误
3. 检查 deepseek_analyses 表

**解决方法：**
```sql
-- 检查订单状态
SELECT * FROM orders WHERE id = '订单ID';

-- 手动标记完成
UPDATE orders 
SET status = 'completed', completed_at = now() 
WHERE id = '订单ID';
```

### 问题3：价格没有递减

**检查步骤：**
```sql
-- 查看用户定价信息
SELECT * FROM user_pricing_info 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'user@test.com');

-- 查看已完成订单数
SELECT COUNT(*) FROM orders 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'user@test.com')
AND status = 'completed';
```

---

## 🔄 重置测试数据

**警告：以下操作会删除所有测试数据！**

```sql
-- 清空所有测试相关数据
DELETE FROM deepseek_analyses;
DELETE FROM orders;
DELETE FROM gift_code_redemptions;
DELETE FROM gift_codes;
DELETE FROM user_pricing_info;
DELETE FROM test_submissions;

-- 保留用户账号，只重置角色
UPDATE profiles SET role = 'user'::user_role WHERE role = 'admin';
```

---

## 📞 需要帮助？

如果遇到问题：
1. 查看浏览器控制台（F12）的错误信息
2. 检查 Supabase 日志
3. 查看本文档的故障排查部分
4. 检查数据库表结构和数据

---

## ✅ 测试检查清单

- [ ] 成功设置管理员账号
- [ ] 能够访问管理后台
- [ ] 成功生成礼品码
- [ ] 成功兑换礼品码
- [ ] 成功使用免费次数
- [ ] 成功创建付费订单
- [ ] 成功模拟支付完成
- [ ] 验证价格递减机制
- [ ] 查看管理后台统计数据
- [ ] 测试礼品码停用/激活
- [ ] 测试礼品码过期机制
- [ ] 测试多次使用礼品码

# 礼品码和付费功能测试指南

## 一、成为管理员

### 方法1：修改系统配置（推荐）

1. 使用您想要设置为管理员的邮箱登录系统
2. 记下您的邮箱地址（例如：admin@test.com）
3. 在数据库中更新管理员邮箱配置：

```sql
UPDATE system_config 
SET config_value = 'admin@test.com' 
WHERE config_key = 'admin_email';
```

4. 更新您的用户角色为管理员：

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@test.com';
```

5. 刷新页面，您现在应该可以看到"管理后台"入口

### 方法2：直接修改用户角色

如果您已经登录，可以直接修改您的用户角色：

```sql
-- 查看您的用户ID和邮箱
SELECT id, email, role FROM profiles;

-- 将特定用户设置为管理员
UPDATE profiles 
SET role = 'admin' 
WHERE email = '您的邮箱@example.com';
```

## 二、测试礼品码功能

### 1. 生成礼品码（管理员操作）

1. 使用管理员账号登录
2. 点击右上角的"管理后台"按钮
3. 在管理后台页面，点击"礼品码管理"标签
4. 在礼品码生成区域：
   - **最大兑换次数**：设置礼品码可以被使用的次数（例如：1 = 单次使用，10 = 可使用10次）
   - **有效期（天）**：设置礼品码的有效期（留空 = 永久有效）
5. 点击"生成礼品码"按钮
6. 系统会生成一个8位的礼品码（例如：ABC12345）
7. 点击"复制"按钮复制礼品码

### 2. 查看和管理礼品码

在礼品码管理页面，您可以看到：
- **礼品码**：生成的礼品码字符串
- **状态**：激活/已停用
- **使用情况**：已使用次数/最大次数
- **有效期**：过期时间（如果设置了）
- **操作按钮**：
  - 复制：复制礼品码到剪贴板
  - 停用/激活：切换礼品码的激活状态

### 3. 兑换礼品码（普通用户操作）

1. 使用普通用户账号登录（非管理员）
2. 完成所有测试（人格测试、交易特征测试、数学金融测试、风险偏好测试）
3. 在结果页面，您会看到"购买 DeepSeek AI 分析"卡片
4. 点击"有礼品码？点击兑换"按钮
5. 在弹出的输入框中输入礼品码
6. 点击"兑换"按钮
7. 兑换成功后，您会看到：
   - 成功提示消息
   - 免费分析次数增加（显示在卡片顶部）

### 4. 使用免费分析次数

1. 兑换礼品码后，在购买卡片顶部会显示：
   ```
   🎁 您有 X 次免费分析机会
   ```
2. 点击"使用免费次数"按钮
3. 系统会自动：
   - 扣除一次免费次数
   - 生成 DeepSeek AI 分析报告
   - 显示分析结果

## 三、测试付费功能

### 1. 查看价格体系

系统采用递减价格策略：
- **首次购买**：¥3.99
- **第二次购买**：¥2.99
- **第三次及以后**：¥1.99

### 2. 创建测试订单

1. 使用普通用户账号登录
2. 完成所有测试
3. 在结果页面的"购买 DeepSeek AI 分析"卡片中：
   - 查看当前价格（会根据您的购买历史显示不同价格）
   - 点击"立即购买"按钮
4. 系统会创建一个支付会话并跳转到支付页面

### 3. 模拟支付成功（测试环境）

由于这是演示系统，您可以通过以下方式模拟支付成功：

**方法1：直接更新订单状态**

```sql
-- 查看您的订单
SELECT id, status, amount, test_result_id, created_at 
FROM orders 
WHERE user_id = (SELECT id FROM profiles WHERE email = '您的邮箱@example.com')
ORDER BY created_at DESC 
LIMIT 5;

-- 将最新订单标记为已完成
UPDATE orders 
SET status = 'completed', 
    completed_at = now() 
WHERE id = '订单ID';
```

**方法2：使用支付成功页面**

1. 获取订单ID（从数据库或控制台日志）
2. 直接访问支付成功页面：
   ```
   /payment-success?session_id=订单ID
   ```
3. 系统会自动触发分析生成流程

### 4. 验证付费功能

支付成功后，系统应该：
1. 显示支付成功提示
2. 自动生成 DeepSeek AI 分析报告
3. 在结果页面显示完整的分析内容
4. 更新用户的购买历史
5. 下次购买时价格会降低

## 四、管理员功能测试

### 1. 查看统计数据

在管理后台的"概览"标签中，您可以看到：
- 总用户数
- 总测试次数
- 总订单数
- 总收入
- 礼品码统计（总数、已使用、剩余次数）

### 2. 用户管理

在"用户管理"标签中：
- 查看所有用户列表
- 查看用户的测试历史
- 查看用户的订单历史
- 查看用户的定价信息

### 3. 订单管理

在"订单管理"标签中：
- 查看所有订单
- 筛选订单状态（待支付/已完成/已取消）
- 查看订单详情

### 4. 系统设置

在"系统设置"标签中：
- 修改系统配置
- 设置管理员邮箱
- 调整价格策略

## 五、常见问题

### Q1: 礼品码兑换失败？

检查以下几点：
- 礼品码是否正确（区分大小写）
- 礼品码是否已过期
- 礼品码是否已达到最大使用次数
- 礼品码是否处于激活状态

### Q2: 无法看到管理后台入口？

确认：
- 您的用户角色是否为 'admin'
- 刷新页面后重新检查
- 查看数据库中的 profiles 表确认角色

### Q3: 支付后没有生成分析？

检查：
- 订单状态是否为 'completed'
- 查看浏览器控制台是否有错误信息
- 检查 deepseek_analyses 表是否有对应记录

### Q4: 价格没有递减？

确认：
- 查看 user_pricing_info 表中的 completed_analyses 字段
- 确保之前的订单状态为 'completed'
- 刷新页面重新加载价格信息

## 六、数据库查询参考

### 查看所有礼品码
```sql
SELECT * FROM gift_codes ORDER BY created_at DESC;
```

### 查看礼品码兑换记录
```sql
SELECT 
  gcr.*,
  p.email as user_email
FROM gift_code_redemptions gcr
JOIN profiles p ON gcr.user_id = p.id
ORDER BY gcr.redeemed_at DESC;
```

### 查看用户的免费分析次数
```sql
SELECT 
  user_id,
  SUM(remaining_uses) as total_free_analyses
FROM gift_code_redemptions
WHERE user_id = '用户ID'
GROUP BY user_id;
```

### 查看所有订单
```sql
SELECT 
  o.*,
  p.email as user_email
FROM orders o
JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC;
```

### 查看用户定价信息
```sql
SELECT 
  p.email,
  upi.*
FROM user_pricing_info upi
JOIN profiles p ON upi.user_id = p.id
ORDER BY upi.completed_analyses DESC;
```

## 七、测试流程示例

### 完整测试流程

1. **准备阶段**
   - 设置管理员账号
   - 登录管理后台

2. **生成礼品码**
   - 生成一个单次使用的礼品码
   - 生成一个多次使用的礼品码（例如10次）
   - 生成一个有时效的礼品码（例如7天）

3. **测试兑换**
   - 使用普通账号登录
   - 完成所有测试
   - 兑换单次使用礼品码
   - 使用免费次数生成分析

4. **测试付费**
   - 使用另一个普通账号
   - 完成所有测试
   - 创建支付订单（首次购买 ¥3.99）
   - 模拟支付成功
   - 验证分析生成

5. **测试价格递减**
   - 使用同一账号再次完成测试
   - 查看价格是否降为 ¥2.99
   - 再次购买
   - 查看价格是否降为 ¥1.99

6. **管理员验证**
   - 在管理后台查看统计数据
   - 验证用户数、订单数、收入等数据
   - 查看礼品码使用情况

## 八、重置测试数据

如果需要重置测试数据：

```sql
-- 清空订单
DELETE FROM orders;

-- 清空礼品码兑换记录
DELETE FROM gift_code_redemptions;

-- 清空礼品码
DELETE FROM gift_codes;

-- 清空分析记录
DELETE FROM deepseek_analyses;

-- 重置用户定价信息
DELETE FROM user_pricing_info;

-- 清空测试提交记录
DELETE FROM test_submissions;
```

**注意**：执行这些操作会删除所有相关数据，请谨慎操作！

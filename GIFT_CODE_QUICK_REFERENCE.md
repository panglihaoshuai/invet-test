# 礼品码系统快速参考

## 🎯 核心功能

| 功能 | 说明 |
|------|------|
| 礼品码长度 | 8 位（最多 10 位）|
| 免费次数 | 每个礼品码提供 15 次 |
| 使用限制 | 每个用户只能兑换同一礼品码一次 |
| 有效期 | 可设置或永久有效 |

---

## 👨‍💼 管理员快速操作

### 生成礼品码
1. 登录管理后台 `/admin`
2. 点击"礼品码管理"标签
3. 设置参数，点击"生成礼品码"
4. 复制礼品码分享给用户

### 管理礼品码
- **复制**：点击礼品码旁的复制按钮
- **停用**：点击"停用"按钮
- **激活**：点击"激活"按钮

---

## 👥 用户快速操作

### 兑换礼品码
1. 完成测试，进入结果页面
2. 点击"有礼品码？点击兑换"
3. 输入礼品码，点击"兑换"
4. 兑换成功，获得 15 次免费分析

### 使用免费次数
1. 在购买卡片中查看剩余次数
2. 点击"免费获取深度分析"
3. 系统自动消耗 1 次，生成报告

---

## 🔧 常用 SQL 查询

### 查看所有礼品码
```sql
SELECT * FROM gift_code_stats ORDER BY created_at DESC;
```

### 查看用户兑换记录
```sql
SELECT 
  u.email,
  gc.code,
  gcr.remaining_analyses,
  gcr.redeemed_at
FROM gift_code_redemptions gcr
JOIN profiles u ON u.id = gcr.user_id
JOIN gift_codes gc ON gc.id = gcr.gift_code_id
ORDER BY gcr.redeemed_at DESC;
```

### 查看礼品码使用率
```sql
SELECT 
  code,
  current_redemptions,
  max_redemptions,
  ROUND(current_redemptions::numeric / max_redemptions * 100, 2) as usage_rate
FROM gift_codes
WHERE is_active = true
ORDER BY usage_rate DESC;
```

### 手动生成礼品码
```sql
SELECT generate_gift_code();
```

### 检查用户剩余次数
```sql
SELECT get_user_free_analyses('user_id');
```

---

## 🎨 使用场景模板

### 限时活动
```
最大使用次数: 100
有效期: 7 天
礼品码: NEWYEAR24
```

### VIP 专属
```
最大使用次数: 1
有效期: 永久
礼品码: VIP12345
```

### 合作推广
```
最大使用次数: 500
有效期: 30 天
礼品码: PARTNER01
```

---

## ⚠️ 常见错误

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| 礼品码无效或已过期 | 礼品码不存在或已过期 | 检查礼品码是否正确 |
| 您已经使用过此礼品码 | 用户已兑换过 | 使用其他礼品码 |
| 此礼品码已达到最大使用次数 | 礼品码用完 | 联系管理员获取新码 |

---

## 📞 快速链接

- [完整使用指南](./GIFT_CODE_SYSTEM_GUIDE.md)
- [更新总结](./GIFT_CODE_UPDATE_SUMMARY.md)
- [管理员设置](./ADMIN_EMAIL_SETUP.md)
- [快速开始](./QUICK_START.md)

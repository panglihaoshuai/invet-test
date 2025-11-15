# 快速开始指南

## 🚀 5分钟快速设置

### 步骤 1: 配置管理员邮箱

打开项目根目录的 `.env` 文件，找到这一行：

```env
VITE_ADMIN_EMAIL=your-admin-email@example.com
```

将 `your-admin-email@example.com` 替换为您的实际邮箱地址，例如：

```env
VITE_ADMIN_EMAIL=admin@mycompany.com
```

**💡 提示**：这个邮箱将自动成为管理员账号。

---

### 步骤 2: 注册管理员账号

1. 启动应用（如果还没启动）
2. 访问登录页面
3. 输入您在步骤1中配置的邮箱
4. 点击"发送验证码"
5. 输入收到的6位验证码
6. 点击"验证登录"

**✨ 神奇的事情发生了**：系统会自动识别这是管理员邮箱，并将您设置为管理员！

---

### 步骤 3: 访问管理后台

登录成功后，您会自动跳转到管理后台 (`/admin`)。

在这里您可以：
- 📊 查看系统统计数据
- 👥 管理用户
- 💰 查看收入统计
- 🎯 查看阶梯定价效果
- ⚙️ 控制系统功能开关

---

## 🎯 阶梯定价已自动启用

系统已经配置好智能定价策略：

| 用户购买次数 | 价格 | 自动生效 |
|------------|------|---------|
| 第 1 次 | ¥3.99 | ✅ |
| 第 2 次 | ¥2.99 | ✅ |
| 第 3 次及以上 | ¥0.99 | ✅ |

**无需任何额外配置**，用户在购买时会自动看到对应的价格！

---

## 📋 检查清单

完成以下检查，确保一切正常：

- [ ] `.env` 文件中已设置 `VITE_ADMIN_EMAIL`
- [ ] 使用管理员邮箱成功注册
- [ ] 登录后自动跳转到 `/admin`
- [ ] 能看到管理后台界面
- [ ] 统计数据正常显示
- [ ] 阶梯定价统计面板可见

---

## 🎨 用户看到的效果

### 首次购买用户
用户会看到：
- 价格：¥3.99
- 提示：原价 ¥19.99，限时 80% OFF

### 第二次购买用户
用户会看到：
- 价格：¥2.99
- 提示：第二次购买，再降 ¥1.00
- 提示：下次更低至 ¥0.99！

### 老用户（3次及以上）
用户会看到：
- 价格：¥0.99
- 提示：最低价格
- 感谢：感谢您的持续支持！

---

## 🔧 常见问题

### Q: 我配置了邮箱，但没有自动成为管理员？

**A:** 请检查：
1. `.env` 文件是否保存
2. 邮箱地址是否完全匹配（包括大小写）
3. 是否重启了应用

如果还是不行，可以手动设置：
```sql
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email = 'your-email@example.com';
```

### Q: 如何添加更多管理员？

**A:** 两种方法：

**方法1**（推荐）：在管理后台操作
1. 登录管理后台
2. 进入"用户管理"标签
3. 找到要提升的用户
4. 点击"设为管理员"

**方法2**：直接修改数据库
```sql
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email = 'another-admin@example.com';
```

### Q: 价格可以修改吗？

**A:** 可以！修改数据库函数即可：

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

  -- 在这里修改价格
  IF completed_count = 0 THEN
    price := 499; -- 改为 ¥4.99
  ELSIF completed_count = 1 THEN
    price := 399; -- 改为 ¥3.99
  ELSE
    price := 199; -- 改为 ¥1.99
  END IF;

  RETURN price;
END;
$$;
```

### Q: 如何查看用户的购买历史？

**A:** 在管理后台的"测试提交"标签中可以看到所有用户的活动记录。

或者直接查询数据库：
```sql
SELECT * FROM user_pricing_info 
WHERE email = 'user@example.com';
```

---

## 📚 更多文档

需要更详细的信息？查看这些文档：

- 📧 [管理员邮箱配置详细指南](./ADMIN_EMAIL_SETUP.md)
- 💰 [阶梯定价系统详细说明](./PROGRESSIVE_PRICING_GUIDE.md)
- 🛡️ [安全指南](./SECURITY_GUIDE.md)
- 📊 [功能总结](./FEATURE_SUMMARY.md)

---

## 🎉 完成！

恭喜！您已经完成了所有设置。

现在您可以：
- ✅ 使用管理员账号管理系统
- ✅ 查看实时统计数据
- ✅ 享受自动阶梯定价带来的好处
- ✅ 追踪用户购买行为

**祝您使用愉快！** 🚀

---

## 💡 小贴士

1. **定期查看管理后台**
   - 了解用户行为
   - 监控收入情况
   - 分析定价效果

2. **关注阶梯定价统计**
   - 首次购买转化率
   - 复购率
   - 忠诚用户比例

3. **根据数据优化**
   - 如果复购率低，考虑调整第二次价格
   - 如果忠诚用户多，可以推出更多优惠

4. **保持系统安全**
   - 不要分享管理员账号
   - 定期检查操作日志
   - 及时处理异常活动

---

**需要帮助？** 查看文档或联系技术支持。

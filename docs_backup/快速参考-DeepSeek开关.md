# 🚀 DeepSeek 功能开关 - 快速参考

## 📋 一分钟快速上手

### 开启 DeepSeek 功能

```
1. 登录管理员账号
2. 点击"管理员后台"
3. 点击"系统设置"
4. 打开"启用 DeepSeek AI 分析"开关
✅ 完成！
```

### 关闭 DeepSeek 功能

```
1. 登录管理员账号
2. 点击"管理员后台"
3. 点击"系统设置"
4. 关闭"启用 DeepSeek AI 分析"开关
✅ 完成！
```

---

## 🔧 SQL 快速命令

### 查看当前状态
```sql
SELECT config_value FROM system_config WHERE config_key = 'deepseek_enabled';
```

### 开启功能
```sql
UPDATE system_config SET config_value = 'true' WHERE config_key = 'deepseek_enabled';
```

### 关闭功能
```sql
UPDATE system_config SET config_value = 'false' WHERE config_key = 'deepseek_enabled';
```

---

## 📊 功能对比

| 状态 | 用户看到什么 |
|------|-------------|
| ✅ 开启 | 可以看到"获取 AI 深度分析"卡片，可以使用礼品码兑换 |
| ❌ 关闭 | 完全看不到任何 AI 分析相关内容 |

---

## 🎯 常见操作

### 场景1: 测试环境，暂时关闭 AI 功能
```sql
UPDATE system_config SET config_value = 'false' WHERE config_key = 'deepseek_enabled';
```

### 场景2: 生产环境，开启 AI 功能
```sql
UPDATE system_config SET config_value = 'true' WHERE config_key = 'deepseek_enabled';
```

### 场景3: 检查功能是否开启
```sql
SELECT 
  CASE 
    WHEN config_value = 'true' THEN '✅ 已开启'
    ELSE '❌ 已关闭'
  END as status
FROM system_config 
WHERE config_key = 'deepseek_enabled';
```

---

## ⚡ 快速故障排查

### 问题: 用户看不到 AI 分析功能

**检查步骤**:
1. 确认 DeepSeek 开关是否开启
   ```sql
   SELECT config_value FROM system_config WHERE config_key = 'deepseek_enabled';
   ```
2. 如果返回 `'false'`，执行开启命令
   ```sql
   UPDATE system_config SET config_value = 'true' WHERE config_key = 'deepseek_enabled';
   ```
3. 让用户刷新页面（F5）

### 问题: 开关无法保存

**检查步骤**:
1. 确认是管理员账号
   ```sql
   SELECT role FROM profiles WHERE email = 'your-email@example.com';
   ```
2. 确认配置项存在
   ```sql
   SELECT * FROM system_config WHERE config_key = 'deepseek_enabled';
   ```
3. 如果不存在，手动创建
   ```sql
   INSERT INTO system_config (config_key, config_value, description)
   VALUES ('deepseek_enabled', 'false', 'DeepSeek AI分析功能开关（true=开启，false=关闭）');
   ```

---

## 📱 访问路径

### 系统设置页面
- **URL**: `/admin/settings`
- **入口**: 管理员后台 → 系统设置按钮

### 管理员后台
- **URL**: `/admin`
- **入口**: 首页 → 管理员后台按钮（仅管理员可见）

---

## ✅ 快速测试

### 测试开关功能（3分钟）

```
1. 开启 DeepSeek 功能
   - 进入系统设置
   - 打开开关
   
2. 验证用户可见
   - 完成一次测试
   - 查看结果页面
   - 应该能看到"获取 AI 深度分析"卡片
   
3. 关闭 DeepSeek 功能
   - 进入系统设置
   - 关闭开关
   
4. 验证用户不可见
   - 刷新结果页面
   - 应该看不到任何 AI 分析相关内容
   
✅ 测试完成！
```

---

## 🔍 状态检查命令

### 完整状态检查
```sql
SELECT 
  config_key as "配置项",
  config_value as "当前值",
  CASE 
    WHEN config_value = 'true' THEN '✅ 功能已开启'
    WHEN config_value = 'false' THEN '❌ 功能已关闭'
    ELSE '⚠️ 未知状态'
  END as "状态说明",
  description as "描述",
  updated_at as "最后更新时间"
FROM system_config 
WHERE config_key = 'deepseek_enabled';
```

### 查看最近的开关操作
```sql
SELECT 
  action as "操作",
  details as "详情",
  created_at as "操作时间"
FROM admin_logs 
WHERE action = 'update_deepseek_status' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 💡 提示和技巧

### 提示1: 批量操作
如果需要频繁切换，可以创建快捷命令：

```sql
-- 保存为 enable_deepseek.sql
UPDATE system_config SET config_value = 'true' WHERE config_key = 'deepseek_enabled';

-- 保存为 disable_deepseek.sql
UPDATE system_config SET config_value = 'false' WHERE config_key = 'deepseek_enabled';
```

### 提示2: 定时任务
可以设置定时任务自动开启/关闭功能（如工作时间开启，非工作时间关闭）

### 提示3: 监控告警
可以监控配置变更，当开关状态改变时发送通知

---

## 📞 需要帮助？

### 查看详细文档
- [DeepSeek功能开关说明.md](./DeepSeek功能开关说明.md) - 完整文档

### 常见问题
- Q: 开关后需要重启吗？
  - A: 不需要，用户刷新页面即可

- Q: 会影响已购买的分析吗？
  - A: 关闭后，已购买的分析也会隐藏

- Q: 礼品码还能用吗？
  - A: 可以，礼品码功能完全保留

---

**最后更新**: 2025-01-10  
**版本**: v1.1

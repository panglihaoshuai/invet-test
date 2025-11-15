# 本地存储架构说明

## 📋 架构概述

本系统采用**混合存储架构**，将数据分为两类：

### 1. 本地存储（localStorage）
- ✅ 测试结果（Test Results）
- ✅ 游戏历史记录（Game History）
- ✅ 当前测试进度（Current Test Progress）
- ✅ 用户偏好设置（User Preferences）

### 2. 后端存储（Supabase）
- ✅ 用户认证（User Authentication）
- ✅ 支付订单（Payment Orders）
- ✅ DeepSeek AI 分析（AI Analysis Results）

## 🎯 设计理念

### 为什么使用本地存储？

1. **隐私保护**
   - 测试结果包含用户的心理特质和投资偏好等敏感信息
   - 本地存储确保数据不会上传到服务器
   - 用户完全掌控自己的数据

2. **离线可用**
   - 用户可以在没有网络的情况下查看历史记录
   - 测试进度自动保存，刷新页面不会丢失

3. **性能优化**
   - 本地读取速度快，无需网络请求
   - 减少服务器负载和数据库查询

4. **成本控制**
   - 减少数据库存储成本
   - 降低 API 调用次数

### 为什么支付和分析使用后端？

1. **支付安全**
   - 支付订单必须在服务器端验证
   - 防止支付欺诈和重复支付

2. **AI 分析持久化**
   - DeepSeek 分析结果需要缓存，避免重复调用 API
   - 用户支付后可以随时查看分析报告

3. **跨设备访问**
   - 用户在不同设备上登录后可以查看已购买的分析

## 📁 文件结构

```
src/
├── utils/
│   └── localStorage.ts          # 本地存储工具类
├── components/
│   └── common/
│       └── LocalStorageNotice.tsx  # 本地存储说明组件
└── pages/
    ├── HomePage.tsx             # 首页（显示存储说明）
    ├── ResultPage.tsx           # 结果页面（从本地读取）
    └── TestHistoryPage.tsx      # 历史记录页面（从本地读取）
```

## 🔧 本地存储 API

### testResultStorage

```typescript
// 保存测试结果
testResultStorage.saveTestResult(result: TestResult): void

// 获取所有测试结果
testResultStorage.getAllTestResults(): TestResult[]

// 根据ID获取测试结果
testResultStorage.getTestResultById(id: string): TestResult | null

// 删除测试结果
testResultStorage.deleteTestResult(id: string): void

// 清空所有测试结果
testResultStorage.clearAllTestResults(): void

// 导出测试结果（JSON格式）
testResultStorage.exportTestResults(): string

// 导入测试结果
testResultStorage.importTestResults(jsonData: string): void
```

### gameResultStorage

```typescript
// 保存游戏结果
gameResultStorage.saveGameResult(result: GameResult): void

// 获取所有游戏结果
gameResultStorage.getAllGameResults(): GameResult[]

// 根据游戏类型获取结果
gameResultStorage.getGameResultsByType(gameType: string): GameResult[]

// 删除游戏结果
gameResultStorage.deleteGameResult(id: string): void

// 清空所有游戏结果
gameResultStorage.clearAllGameResults(): void

// 导出游戏结果
gameResultStorage.exportGameResults(): string

// 导入游戏结果
gameResultStorage.importGameResults(jsonData: string): void
```

### currentTestStorage

```typescript
// 保存当前测试进度
currentTestStorage.saveCurrentTest(testData: any): void

// 获取当前测试进度
currentTestStorage.getCurrentTest(): any

// 清除当前测试进度
currentTestStorage.clearCurrentTest(): void
```

### storageUtils

```typescript
// 获取存储空间使用情况
storageUtils.getStorageUsage(): { used: number; total: number; percentage: number }

// 检查是否有足够空间
storageUtils.hasEnoughSpace(requiredBytes?: number): boolean

// 清理所有应用数据
storageUtils.clearAllAppData(): void

// 导出所有数据
storageUtils.exportAllData(): string

// 导入所有数据
storageUtils.importAllData(jsonData: string): void
```

## 💾 数据备份与恢复

### 导出数据

用户可以通过以下方式导出数据：

1. **在首页点击"导出备份"按钮**
2. **系统会生成一个 JSON 文件**，包含：
   - 所有测试结果
   - 所有游戏历史记录
   - 用户偏好设置
   - 导出时间戳

3. **文件命名格式**：`投资测评数据备份_YYYY-MM-DD.json`

### 导入数据

用户可以通过以下方式导入数据：

1. **在首页点击"导入数据"按钮**
2. **选择之前导出的 JSON 文件**
3. **系统会自动恢复所有数据**
4. **页面会自动刷新以加载新数据**

### 数据格式

```json
{
  "testResults": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "personality_scores": { ... },
      "math_finance_scores": { ... },
      "risk_preference_scores": { ... },
      "trading_characteristics": { ... },
      "investment_style": "价值投资",
      "euclidean_distance": 0.5,
      "completed_at": "2025-01-01T00:00:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "gameResults": [
    {
      "id": "uuid",
      "game_type": "loss_aversion",
      "score": 85,
      "game_data": { ... },
      "completed_at": "2025-01-01T00:00:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "preferences": {
    "theme": "dark",
    "language": "zh-CN"
  },
  "exportDate": "2025-01-01T00:00:00.000Z"
}
```

## ⚠️ 用户须知

### 重要提示

系统会在首页显示以下提示信息：

1. **数据存储位置**
   - 测试结果和游戏历史记录保存在本地浏览器中
   - 不会上传到服务器

2. **数据丢失风险**
   - 清除浏览器数据会导致所有记录丢失
   - 更换设备或浏览器无法查看之前的记录

3. **备份建议**
   - 建议定期导出备份数据
   - 妥善保管备份文件

4. **存储空间**
   - 显示当前存储使用情况
   - 当使用超过 70% 时会显示警告

### LocalStorageNotice 组件

组件提供两种显示模式：

1. **inline 模式**（默认）
   - 直接在页面中显示完整说明
   - 包含导出、导入、清空数据按钮

2. **dialog 模式**
   - 显示一个按钮，点击后弹出对话框
   - 适合在页面空间有限的情况下使用

```tsx
// inline 模式
<LocalStorageNotice variant="inline" showActions={true} />

// dialog 模式
<LocalStorageNotice variant="dialog" showActions={true} />
```

## 🔄 支付流程中的数据传递

### 问题

由于测试结果存储在本地，DeepSeek 分析需要测试数据，如何传递？

### 解决方案

1. **购买时传递测试数据**
   ```typescript
   // 从本地存储获取测试结果
   const testResult = testResultStorage.getTestResultById(testId);
   
   // 创建支付会话（testResultId 仅作为引用ID）
   const result = await paymentApi.createCheckoutSession(items, testId);
   ```

2. **生成分析时传递测试数据**
   ```typescript
   // 从本地存储获取测试结果
   const testResult = testResultStorage.getTestResultById(testId);
   
   // 调用 DeepSeek API，传入完整的测试数据
   const analysis = await deepseekApi.generateAnalysis(
     testId,      // 引用ID
     orderId,     // 订单ID
     testResult   // 完整的测试数据
   );
   ```

3. **Edge Function 处理**
   ```typescript
   // generate_deepseek_analysis Edge Function
   const { testResultId, orderId, testData } = await req.json();
   
   // testData 包含完整的测试结果
   // testResultId 仅用于关联和缓存
   ```

## 🗄️ 数据库简化

### 移除的表

由于采用本地存储，以下表已从数据库中移除：

- ❌ `test_results` - 测试结果（移至 localStorage）
- ❌ `game_results` - 游戏结果（移至 localStorage）
- ❌ `reports` - 报告（不再需要）
- ❌ `verification_codes` - 验证码（由 Supabase Auth 处理）

### 保留的表

- ✅ `users` - 用户认证
- ✅ `orders` - 支付订单
- ✅ `deepseek_analyses` - AI 分析结果

### 字段说明

#### orders 表
```sql
test_result_id uuid  -- 引用ID，不是外键，实际数据在本地
```

#### deepseek_analyses 表
```sql
test_result_id uuid         -- 引用ID，不是外键
test_data_summary jsonb      -- 测试数据摘要（从本地传入）
```

## 📊 存储空间管理

### 浏览器限制

- 大多数浏览器的 localStorage 限制是 **5-10MB**
- 系统假设 5MB 作为安全值

### 空间使用估算

- 单个测试结果：约 **2-5KB**
- 单个游戏结果：约 **1-3KB**
- 可存储约 **1000-2000** 条测试记录

### 空间不足处理

1. **警告提示**
   - 当使用超过 70% 时显示警告
   - 建议导出备份后清理数据

2. **错误处理**
   - 保存失败时抛出友好的错误提示
   - 提示用户清理浏览器数据

## 🔐 安全性考虑

### 本地存储安全

1. **XSS 防护**
   - 所有用户输入都经过验证和转义
   - 使用 React 的自动 XSS 防护

2. **数据加密**
   - localStorage 数据未加密（浏览器限制）
   - 敏感数据（如支付信息）不存储在本地

3. **隐私保护**
   - 测试结果不上传服务器
   - 用户可以随时清除本地数据

### 后端安全

1. **支付验证**
   - 所有支付通过 Stripe 验证
   - 订单状态在服务器端更新

2. **API 认证**
   - 所有 Edge Function 调用需要 JWT 认证
   - 用户只能访问自己的订单和分析

## 🚀 迁移指南

### 从旧架构迁移

如果之前的数据存储在数据库中，需要：

1. **导出数据库数据**
   ```sql
   SELECT * FROM test_results WHERE user_id = 'xxx';
   SELECT * FROM game_results WHERE user_id = 'xxx';
   ```

2. **转换为 JSON 格式**
   ```javascript
   const exportData = {
     testResults: dbTestResults,
     gameResults: dbGameResults,
     preferences: {},
     exportDate: new Date().toISOString()
   };
   ```

3. **导入到本地存储**
   ```typescript
   storageUtils.importAllData(JSON.stringify(exportData));
   ```

## 📱 跨设备同步

### 当前限制

- 本地存储数据**不会**跨设备同步
- 每个设备/浏览器有独立的数据

### 解决方案

用户可以通过以下方式在设备间同步数据：

1. **在设备 A 导出数据**
2. **通过云盘、邮件等方式传输文件**
3. **在设备 B 导入数据**

### 未来优化

可以考虑添加：
- 云端备份功能（可选）
- 自动同步功能（需要用户授权）

## 🧪 测试建议

### 功能测试

1. **测试结果保存**
   - 完成测试后检查 localStorage
   - 刷新页面后数据应该保留

2. **数据导出导入**
   - 导出数据并检查 JSON 格式
   - 清空数据后导入，验证恢复正确

3. **存储空间警告**
   - 模拟存储空间不足的情况
   - 验证警告提示正确显示

4. **支付流程**
   - 验证测试数据正确传递给 Edge Function
   - 验证分析生成使用本地数据

### 边界测试

1. **存储空间满**
   - 填满 localStorage
   - 验证错误提示友好

2. **数据损坏**
   - 手动修改 localStorage 数据
   - 验证系统能够处理损坏数据

3. **浏览器兼容性**
   - 测试不同浏览器的 localStorage 行为
   - 验证隐私模式下的表现

## 📖 用户教育

### 首次使用

用户首次访问系统时，应该看到：

1. **欢迎提示**
   - 解释本地存储的优势
   - 提示定期备份数据

2. **存储说明**
   - 显示 LocalStorageNotice 组件
   - 提供导出导入功能

### 持续提醒

- 在测试历史页面显示备份提示
- 存储空间不足时显示警告
- 提供一键导出功能

## 🔄 更新日志

### v2.0.0 - 本地存储架构

**重大变更**：
- ✅ 测试结果和游戏历史改为本地存储
- ✅ 简化数据库结构，只保留认证和支付
- ✅ 添加数据导出导入功能
- ✅ 添加存储空间管理
- ✅ 更新 DeepSeek Edge Function 接受测试数据

**迁移步骤**：
1. 应用数据库迁移 `04_simplify_backend_storage.sql`
2. 更新前端代码使用 localStorage API
3. 重新部署 Edge Functions
4. 通知用户数据存储方式变更

---

**文档版本**：2.0.0  
**最后更新**：2025-11-10  
**维护者**：开发团队

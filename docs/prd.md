# 人格特质投资策略评估系统需求文档（安全增强版 + 一键部署版）

## 1. 项目概述
\n### 1.1 系统名称
人格特质投资策略评估系统

### 1.2 系统描述
这是一个Web应用程序，用于评估用户的人格特质、数学/金融能力以及风险偏好，并推荐合适的投资策略。系统通过科学的测评方法和欧几里得距离算法，为用户提供个性化的投资建议和详细报告。支持本地化数据存储和历史记录回顾功能。系统提供标准版和完整版两种测试模式，完整版融合多样化游戏测试体验，测试时长20-30分钟。新增DeepSeek AI深度解读服务，用户可付费获取专业的个性化投资建议。系统配备完整的后台管理面板和多层安全防护机制。支持礼品码功能，礼品码持有者可免费体验15次完整功能。
\n## 2. 核心功能\n
### 2.1 用户认证系统（安全增强版）
- **邮件验证码登录功能**：
  - 6位数字验证码，有效期5分钟
  - **图形验证码防护**：发送邮件验证码前需完成图形验证码验证
  - **频率限制**：同一邮箱每分钟最多发送1次验证码，每小时最多5次
  - **IP限制**：同一IP地址每小时最多发送20次验证码请求
  - **黑名单机制**：恶意请求IP自动加入临时黑名单（24小时）
- **用户会话管理**：
  - JWT Token认证，支持自动续期
  - 异常登录地点检测和邮件通知
  - 会话超时自动登出机制
- **礼品码验证系统**：
  - 支持10位以内随机礼品码验证
  - 礼品码激活后自动获得15次免费AI解读权限
  - 礼品码使用状态和剩余次数跟踪

### 2.2 后台管理面板
\n#### 2.2.1 管理员认证（简化版）
- **管理员身份规定**：
  - 系统预设指定管理员邮箱（在环境变量中设置）
  - 指定邮箱用户注册成功后自动获得管理员权限
  - 管理员用户登录后自动跳转到管理后台界面
  - 普通用户无法访问管理后台功能
- **自动权限分配**：系统检测到指定邮箱注册时自动标记为管理员账户
- **操作日志**：记录所有管理员操作行为和时间戳

#### 2.2.2 数据统计面板
- **测试数据统计**：
  - 测试总数（累计）
  - 今日测试数量
  - 独立用户数量（去重统计）
  - 本周/本月测试量趋势图
  - 测试完成率统计（标准版vs完整版）\n  - 用户留存率和复测率分析
  - 测试时长分布统计

- **用户地理分布**：
  - 用户IP地址归属地统计\n  - 地理位置热力图展示
  - 国家/省份/城市维度的用户分布\n  - 异常IP地址监控和标记

- **支付数据统计**：
  - 支付订单数量（总数和今日新增）
  - 支付总金额（累计和今日收入）
  - 支付成功率和失败率统计
  - 支付方式分布（支付宝/微信占比）
  - 退款申请和处理统计
  - 收入趋势图和预测分析

- **礼品码数据统计**：
  - 礼品码生成总数和使用率
  - 礼品码激活用户数量
  - 礼品码剩余次数分布统计
  - 礼品码使用频率和转化率分析

#### 2.2.3 系统控制面板
- **支付系统开关**：
  - 一键开启/关闭AI解读付费服务
  - 价格调整功能（支持动态定价策略）
  - 促销活动配置（折扣码、限时优惠）
  - 支付渠道开关（独立控制支付宝/微信）\n
- **系统功能开关**：
  - 新用户注册开关
  - 游戏模块开关（可单独控制各个游戏）
  - 邮件发送功能开关
  - 维护模式开关\n  - **礼品码功能开关**：一键开启/关闭礼品码验证功能

- **礼品码管理系统**：
  - **礼品码生成器**：\n    - 支持批量生成礼品码（1-100个）
    - 礼品码长度设置（1-10位）\n    - 随机字符组合（数字+字母，可选大小写）
    - 生成时间和管理员记录
  - **礼品码列表管理**：
    - 查看所有生成的礼品码
    - 礼品码状态（未使用/已激活/已用完）
    - 礼品码使用者信息和激活时间
    - 剩余使用次数实时显示
    - 支持礼品码搜索和筛选
  - **礼品码控制**：
    - 单个礼品码禁用/启用
    - 批量礼品码操作\n    - 礼品码有效期设置（可选）
    - 礼品码使用次数重置功能

#### 2.2.4 用户管理\n- **用户列表**：查看所有注册用户信息
- **用户行为分析**：单个用户的测试历史和支付记录
- **异常用户标记**：标记可疑账户和恶意行为
- **用户封禁**：临时或永久封禁违规用户
- **礼品码用户管理**：查看使用礼品码的用户列表和使用情况

#### 2.2.5 安全监控
- **实时攻击监控**：显示当前遭受的攻击类型和频率
- **IP黑名单管理**：查看和管理被封禁的IP地址
- **异常行为告警**：异常登录、批量注册、恶意请求告警
- **系统性能监控**：CPU、内存、数据库性能实时监控

#### 2.2.6 管理员操作审计
- **操作日志记录**：\n  - 管理员登录/登出时间
  - 系统设置修改记录（开关状态变更、价格调整等）
  - 用户管理操作（封禁、解封等）
  - 数据查询和导出记录
  - **礼品码操作记录**：礼品码生成、禁用、重置等操作\n  - IP和地理位置信息
- **日志查询功能**：支持按时间、操作类型、管理员筛选
- **安全审计**：定期生成管理员操作报告

### 2.3 测试模式选择
\n#### 2.3.1 测试版本选择
- **标准版测试**：传统问卷形式，测试时长10-15分钟
- **完整版测试**：融合多样化游戏体验的深度测试，测试时长20-30分钟
- 用户可在开始前选择测试版本，系统会显示预估完成时间

### 2.4 测评流程

#### 2.4.1 人格特质测试（升级版）
基于Big Five Inventory (BFI)和16Personalities理论框架，融合自我观察与行为分析的综合评估：
\n**五大人格维度评估：**
- **开放性评估**：\n  - 喜欢尝试新事物（如投资新策略）的程度
  - 创意想法产生频率和接受度
  - 对新投资工具和市场的探索意愿
  - 面对未知投资机会的态度

- **尽责性评估**：
  - 做事计划性和守时习惯
  - 风险规避倾向和谨慎程度
  - 投资决策前的研究深度
  - 长期目标坚持能力

- **外向性评估**：
  - 社交偏好和自信表达能力
  - 在群体中的活跃程度
  - 分享投资观点和寻求建议的倾向
  - 独立决策vs集体讨论偏好

- **宜人性评估**：
  - 对他人的信任程度
  - 合作vs竞争的优先级
  - 投资建议接受度
  - 市场情绪影响敏感度

- **神经质评估**：\n  - 焦虑和情绪波动频率
  - 压力敏感度和应对方式
  - 市场波动时的情绪反应
  - 亏损容忍度和恢复能力

**交易特征综合评估：**
- **交易频率偏好**：日内交易、短线、中线、长线持有倾向
- **交易兴趣领域**：股票、基金、期货、数字货币等偏好
- **交易标的选择**：大盘股vs小盘股、成长股vs价值股偏好
- **交易策略倾向**：\n  - 主观性哲学工具：波浪理论、缠论、技术形态分析
  - 数据驱动型：量化分析、基本面分析、统计套利
  - 混合型：技术面结合基本面分析
- **风险管理习惯**：止损设置、仓位控制、分散投资实践
- **信息获取方式**：研报依赖度、社交媒体影响、独立研究比重

#### 2.4.2 数学与金融能力测试
涵盖概率、复利等金融数学知识的多选题

#### 2.4.3 风险偏好测试\n
**标准版：**
通过假设投资场景评估用户风险容忍度\n
**完整版游戏化测试：**
\n**气球风险游戏（Balloon Risk Game）：**
- **游戏机制**：
  - 用户面对一个气球，每次点击'扎一下'获得10金币
  - 扎得次数越多，气球爆炸风险越高
  - 爆炸临界点随机设定（8-25次之间），用户无法预知
  - 气球爆炸时，当轮所有金币清零
  - 用户可随时选择'收手'保留当前金币
- **测试维度**：
  - 风险承受能力：平均每轮扎气球次数
  - 损失厌恶程度：爆炸后的行为变化
  - 收益预期：目标金币数量设定
  - 决策一致性：多轮游戏中策略稳定性
- **游戏设置**：
  - 总共进行5轮游戏
  - 每轮开始前显示当前总金币数
  - 实时显示当轮已扎次数和累积金币
  - 提供'继续扎'和'收手'两个选项
  - 爆炸时有视觉和音效反馈\n
**等待收获游戏（测试耐心与纪律性）：**
- **游戏机制**：\n  - 模拟长期持有投资，用户控制一个'农场'或'矿场'
  - 初始投资100金币，成长周期随机（10-30轮），每轮增长5-15%收益
  - 随时可'收获'锁定当前收益，但早收获损失潜力
  - 等太久可能遇'风暴'事件减值20-50%
  - 用户可选择'加注'增加成长速度，但提高风险
- **测试维度**：
  - 持有耐力：长线vs短线偏好
  - 高耐心者倾向等满周期，反映价值投资心态
  - 低耐心者早卖，类似波段或超短线交易者
- **量化指标**：
  - 平均等待轮数（>20轮=高耐心）
  - 加注频率（高=冒险偏好）
  - 胜率通过模拟历史回报计算
\n**拍卖竞价游戏（测试贪婪与锚定偏差）：**
- **游戏机制**：\n  - 用户参与虚拟拍卖，竞拍'神秘资产'（如加密币或股票模拟）
  - 每轮资产起拍价10金币，用户出价增幅至少5金币
  - 出价过高可能'爆仓'（资产实际价值随机，低于出价则亏损）
  - 可随时退出锁定当前最低价
  - 偶尔有'锚定陷阱'，如显示虚假高价历史，诱导用户追高\n- **测试维度**：\n  - 捕捉贪婪（FOMO - Fear Of Missing Out）和锚定（受初始价影响）
  - 贪婪者常追高，类似趋势跟踪中过度杠杆
  - 理性者早退，反映风险控制
- **量化指标**：
  - 平均出价倍数（>2倍起拍=高贪婪）
  - 退出时机（早退率高=低锚定偏差）
  - 行为数据可计算偏差分数

**双门选择游戏（测试损失厌恶与决策偏差）：**
- **游戏机制**：
  - 类似于蒙提霍尔问题变体，用户面对两扇门
  - 门A：固定+20金币（安全）
  - 门B：50% +50金币，50% -30金币（风险）
  - 用户初始选门后，显示提示（如'另一门可能更好'），可切换
  - 多轮后统计
- **测试维度**：
  - 评估损失厌恶（更怕亏本而选安全门）和现状偏差（不愿切换）
  - 高损失厌恶者偏好门A，类似保守价值投资\n  - 冒险者选B，反映期权或杠杆偏好
- **量化指标**：
  - 选择门B比例（>60%=高风险容忍）
  - 切换频率（低=现状偏差强）
  - 用期望值计算整体行为偏好

**群体羊群游戏（测试从众心理与独立思考）：**\n- **游戏机制**：
  - 用户在虚拟'市场广场'中决定买/卖资产
  - 屏幕显示'其他交易者'的选择（AI模拟群体行为，如多数人追涨）
  - 资产价格随机波动，用户有100金币，可买/卖
  - 显示'羊群指标'：如'80%交易者正在买入'，但实际结果随机
  - 用户可忽略群体，选择独立策略；多轮后结算
- **测试维度**：
  - 识别从众偏好（羊群效应）\n  - 从众者跟风，类似社交媒体驱动的趋势跟踪
  - 独立者反向操作，反映逆向投资心态
- **量化指标**：
  - 跟从群体比例（>70%=高从众）
  - 独立决策胜率\n  - 结合时间压力测试反应速度

**快速反应游戏（测试决策速度与情绪控制）：**
- **游戏机制**：
  - 模拟日内交易，用户监控'价格图表'（随机生成K线）
  - 每轮10秒内响应信号（如价格突破），正确决策+10金币，超时或错判-5金币
  - 加入情绪干扰：如连续亏损后出现'复仇交易'诱导（高杠杆选项）
  - 可暂停'冷静期'避免冲动\n- **测试维度**：\n  - 评估情绪控制和速度偏好
  - 快决策者适合超短线；慢而稳者偏长线
  - 连续亏损后行为反映tilt（情绪失控）
- **量化指标**：
  - 平均响应时间（<5秒=高速度偏好）
  - 冷静期使用率（高=好情绪控制）
  - 计算冲动决策比例

### 2.5 游戏化测试引擎
\n#### 2.5.1 游戏框架\n- **Canvas渲染引擎**：使用HTML5 Canvas绘制游戏界面
- **动画系统**：CSS3动画配合JavaScript实现流畅交互
- **音效系统**：Web Audio API提供游戏音效反馈
- **数据收集**：实时记录用户游戏行为数据
- **游戏选择器**：用户可直接选择想要体验的游戏类型

#### 2.5.2 游戏数据分析
- **行为模式识别**：分析用户在游戏中的决策模式
- **风险偏好量化**：将游戏表现转换为风险偏好分数
- **情绪稳定性评估**：通过多轮游戏表现评估情绪控制能力
- **学习适应能力**：分析用户策略调整和学习曲线
- **多维度综合分析**：整合不同游戏的测试结果形成完整画像

#### 2.5.3 游戏选择与流程
- **自由选择模式**：用户可直接选择任意游戏开始体验
- **推荐流程模式**：系统根据测试进度推荐最适合的游戏
- **快速体验模式**：每个游戏提供2-3分钟的快速体验版本
- **完整测试模式**：按照科学测试流程完成所有游戏\n
### 2.6 数据处理与分析
- 使用欧几里得距离量化不同性格偏好
- 计算用户人格向量与预定义投资风格向量的匹配度
- 结合交易特征数据和多样化游戏测试数据进行多维度投资性格画像构建
- 支持趋势跟踪、波段交易、价值投资等多种投资风格匹配
- **多游戏数据融合算法**：将不同游戏的测试结果进行加权融合和交叉验证\n
### 2.7 DeepSeek AI深度解读服务（递减定价版）

#### 2.7.1 服务概述
- **付费服务**：用户完成测评后可选择支付获取DeepSeek AI专业解读
- **递减定价策略**：首次购买3.99元，第二次2.99元，第三次及以后0.99元
- **深度分析**：基于测评数据提供个性化投资建议和心理分析
- **专业解读**：结合用户人格特质、游戏表现和风险偏好的综合分析报告
- **礼品码免费体验**：礼品码用户可免费获得15次AI解读服务

#### 2.7.2 定价机制
- **用户购买记录跟踪**：系统自动记录每个用户的AI解读购买次数
- **动态价格计算**：
  - 第1次购买：3.99元人民币
  - 第2次购买：2.99元人民币
  - 第3次及以后：0.99元人民币
- **礼品码用户定价**：礼品码用户前15次完全免费，第16次开始按正常定价
- **价格显示**：用户界面实时显示当前应付金额和优惠信息
- **购买历史管理**：后台管理面板可查看用户购买次数和定价历史

#### 2.7.3 DeepSeek集成功能
- **数据整合与传输**：\n  - 自动整合用户完整测评数据（人格测试、数学金融测试、风险偏好测试、游戏数据）
  - 生成结构化数据摘要传输给DeepSeek API
  - 包含用户基本画像、测试分数、游戏行为模式、风险偏好等关键信息

- **固定提示词约束系统**：
  - 预设专业投资心理学提示词模板
  - 约束DeepSeek输出专业、准确的投资建议\n  - 确保解读内容符合金融投资规范和心理学原理
  - 避免过度承诺收益或提供具体投资标的推荐
\n- **AI解读内容结构**：
  - **人格特质深度分析**：详细解读五大人格维度对投资行为的影响
  - **投资心理画像**：基于游戏表现分析用户的投资心理特征
  - **风险管理建议**：针对用户风险偏好提供个性化风险控制策略
  - **投资策略匹配**：推荐最适合的投资风格和策略类型
  - **行为偏差提醒**：识别并提醒用户可能存在的投资行为偏差
  - **成长建议**：提供投资能力提升的具体建议和学习方向

#### 2.7.4 支付与服务流程
- **支付触发**：测评完成后在报告页面显示'获取AI深度解读'选项
- **动态定价显示**：根据用户购买历史显示当前价格\n- **礼品码检测**：自动检测用户是否为礼品码用户，显示免费次数
- **支付处理**：集成支付宝/微信支付，支持递减定价策略
- **服务交付**：支付成功后自动调用DeepSeek API生成深度解读
- **结果展示**：AI解读内容以独立章节形式添加到用户报告中
- **服务记录**：记录用户AI解读购买历史、定价记录和内容缓存

### 2.8礼品码系统

#### 2.8.1 礼品码生成与管理
- **礼品码生成规则**：
  - 长度：1-10位可配置
  - 字符组合：数字+字母（大小写可选）
  - 随机算法：确保唯一性和随机性
  - 批量生成：支持1-100个批量生成
- **礼品码权限**：
  - 每个礼品码提供15次免费AI解读权限
  - 礼品码激活后立即生效
  - 支持多用户使用同一礼品码（可配置）
- **礼品码状态管理**：
  - 未使用：礼品码已生成但未被任何用户激活
  - 已激活：礼品码已被用户激活，开始计算使用次数
  - 已用完：礼品码的15次免费权限已全部使用
  - 已禁用：管理员手动禁用的礼品码\n
#### 2.8.2 用户礼品码体验
- **礼品码激活入口**：
  - 用户注册/登录后可输入礼品码
  - 支付页面提供礼品码输入选项
  - 个人中心显示礼品码状态和剩余次数\n- **免费权限使用**：
  - 礼品码用户在AI解读页面显示'免费使用'按钮
  - 实时显示剩余免费次数
  - 免费次数用完后自动切换到付费模式\n- **权限叠加规则**：
  - 用户可激活多个礼品码，免费次数累加
  - 优先使用礼品码免费次数，再使用付费购买
\n#### 2.8.3 礼品码数据跟踪
- **使用统计**：
  - 每个礼品码的激活用户列表
  - 礼品码使用时间和频率统计
  - 礼品码转化率分析（免费用户转付费用户比例）
- **用户行为分析**：
  - 礼品码用户vs付费用户的行为对比
  - 礼品码用户的留存率和活跃度\n  - 免费次数使用完后的付费转化率
\n### 2.9 本地化存储与历史记录
- **本地数据存储**：使用浏览器LocalStorage和IndexedDB存储测试数据
- **历史记录管理**：保存每次测试的完整记录，包括测试时间、答题详情、游戏表现、评估结果、AI解读内容\n- **历史回顾功能**：
  - 测试历史列表展示，按时间倒序排列\n  - 单次测试详情查看，包含当时的答题情况、游戏回放、分析结果和AI解读
  - 历史趋势分析，展示人格特质变化曲线
  - 历史报告重新下载功能（包含AI解读内容）
- **数据对比功能**：支持选择不同时间点的测试结果进行对比分析
- **数据导出**：支持将历史数据导出为JSON格式进行备份
- **游戏回放功能**：保存所有游戏过程数据，支持历史游戏表现回放
- **AI解读缓存**：本地缓存已购买的AI解读内容，支持离线查看
- **购买记录存储**：本地和云端同步存储用户AI解读购买次数和定价历史
- **礼品码信息存储**：本地存储用户礼品码激活状态和剩余次数\n
### 2.10 报告生成与下载
- 自动生成包含评估结果和投资建议的PDF报告
- **完整版报告增强**：包含多样化游戏测试分析、行为模式图表、风险偏好热力图\n- **AI解读集成**：付费用户的报告自动包含DeepSeek AI深度解读章节
- 支持报告预览和下载功能\n- 历史报告重新生成和下载\n- 本地报告缓存机制
- **分层报告服务**：基础报告免费，AI增强报告付费
- **礼品码用户报告**：礼品码用户可免费下载包含AI解读的完整报告

## 3. 安全防护体系

### 3.1 DDoS攻击防护
- **CDN防护**：使用Cloudflare或阿里云CDN进行流量清洗\n- **限流机制**：
  - API接口限流：每个IP每分钟最多100次请求
  - 登录限流：每个IP每小时最多20次登录尝试
  - 测试限流：每个用户每天最多完成5次完整测试
- **负载均衡**：多服务器部署，自动故障转移
- **异常流量检测**：实时监控异常请求模式，自动触发防护

### 3.2恶意劫持防护\n- **HTTPS强制**：全站HTTPS加密，HSTS安全头设置
- **CSP内容安全策略**：防止XSS攻击和代码注入
- **CSRF防护**：所有状态改变操作需要CSRF Token验证
- **SQL注入防护**：使用参数化查询，输入验证和过滤
- **文件上传安全**：严格限制文件类型，病毒扫描
\n### 3.3 身份验证安全
- **多重验证**：
  - 图形验证码（防机器人）
  - 邮箱验证码（防批量注册）
  - 设备指纹识别（检测异常登录）
- **会话安全**：
  - JWT Token加密存储
  - 会话超时自动登出
  - 异地登录邮件通知
- **礼品码安全**：
  - 礼品码加密存储
  - 防止礼品码暴力破解
  - 礼品码使用频率限制

### 3.4 数据安全
- **数据加密**：
  - 敏感数据AES-256加密存储
  - 传输过程TLS 1.3加密
  - 支付信息端到端加密\n- **数据备份**：
  - 自动定时备份\n  - 异地灾备存储
  - 数据恢复测试
\n### 3.5 监控告警\n- **实时监控**：
  - 系统性能监控（CPU、内存、磁盘）
  - 网络流量监控\n  - 数据库性能监控
  - 应用错误监控
- **安全告警**：
  - 异常登录告警
  - 大量失败请求告警
  - 系统资源异常告警
  - 支付异常告警
- 礼品码异常使用告警
- **日志审计**：
  - 完整的操作日志记录
  - 日志集中存储和分析
  - 安全事件追溯
\n## 4. 技术架构\n
### 4.1 前端技术栈
- React.js (v18+)构建单页应用
- Redux或Context API进行状态管理
- Material-UI (MUI) 或 Tailwind CSS 提供UI组件\n- React Hook Form处理表单验证
- Axios处理HTTP请求\n- Dexie.js 管理IndexedDB本地数据库
- LocalStorage API 处理轻量级数据存储
- **游戏引擎相关**：
  - Konva.js 或PixiJS 用于Canvas游戏渲染
  - Framer Motion 提供高级动画效果
  - Howler.js 处理游戏音效\n  - Chart.js 生成游戏数据可视化图表
  - React Router 管理游戏路由和状态
- **支付集成**：
  - 支付宝SDK或微信支付SDK
  - 支付状态管理和回调处理
- **安全组件**：
  - react-google-recaptcha 图形验证码\n  - crypto-js 前端加密库
  - fingerprintjs2 设备指纹识别
- **礼品码组件**：
  - 礼品码输入验证组件
  - 礼品码状态显示组件
  - 免费次数倒计时组件

### 4.2 后端技术栈
- Node.js + Express.js 构建API服务器
- MongoDB + Mongoose ODM 进行数据存储
- Math.js处理欧几里得距离计算
- pdf-lib或jsPDF生成PDF报告
- NodeMailer处理邮件发送
- **DeepSeek集成**：
  - DeepSeek API SDK集成
  - 提示词模板管理系统
  - AI响应内容处理和格式化
  - API调用频率控制和错误处理\n- **支付处理**：
  - 支付宝/微信支付服务端SDK
  - 支付订单管理和状态跟踪
  - 支付安全验证和签名处理
  - **递减定价逻辑**：用户购买次数跟踪和动态价格计算
- **礼品码系统**：
  - 礼品码生成算法（随机字符串生成）
  - 礼品码验证和激活逻辑
  - 礼品码使用次数跟踪
  - 礼品码状态管理和更新
- **游戏数据处理**：
  - TensorFlow.js 进行游戏行为模式分析
  - D3.js 生成复杂数据可视化\n  - 机器学习算法进行多游戏数据关联分析
- **安全中间件**：\n  - helmet.js 安全头设置
  - express-rate-limit 请求限流
  - express-validator 输入验证
  - bcrypt 密码加密
  - jsonwebtoken JWT处理
- **后台管理**：
  - Express Admin 后台框架
  - Socket.io 实时数据推送
  - node-cron 定时任务\n  - winston 日志管理
  - **管理员自动识别**：邮箱匹配和权限自动分配逻辑

### 4.3 数据存储架构
采用混合存储策略：
```
[前端本地存储]
├── LocalStorage: 用户偏好设置、会话信息、游戏选择记录、AI解读缓存、购买次数记录、礼品码状态
├── IndexedDB: 测试历史记录、多游戏回放数据、报告缓存、AI解读内容、定价历史、礼品码使用记录
└── SessionStorage: 当前测试进度、游戏状态、跨游戏数据传递、支付状态\n
[后端云存储]
├── MongoDB: 用户账户信息、管理员标识、统计数据、多游戏行为分析、AI解读记录、支付订单、购买次数跟踪、礼品码数据
├── Redis: 会话缓存、限流计数、实时统计数据、IP黑名单、礼品码缓存\n└── 临时存储: PDF报告生成缓存、DeepSeek API响应缓存\n```
\n### 4.4 系统架构\n采用模块化微服务架构，确保低耦合和高可维护性：
```
[CDN/WAF]<--> [负载均衡器] <--> [用户浏览器]
|\n                    v\n[前端SPA (React)] <--> [多游戏引擎模块] <--> [本地存储层]
                    |
                    v
[API网关 + 安全中间件] <--> [后端服务集群]
                    |                    |
                    v                    v
[认证服务] <--> [测试服务] <--> [支付服务] <--> [AI服务] <--> [定价服务] <--> [礼品码服务]
                    |                    |
                    v                    v
[数据库集群] <--> [缓存集群] <--> [监控系统] <--> [后台管理]
                |
                    v
[文件存储] <--> [邮件服务] <--> [日志系统]
```\n
## 5. 设计风格\n
### 5.1 整体风格
采用简约现代化设计，受Spotify暗模式启发的黑绿配色方案\n\n### 5.2 配色方案
- 主色：黑色 (#000000)作为背景色
- 强调色：Spotify绿 (#1DB954) 用于按钮、高亮和进度指示器
- 次要色：深灰 (#181818) 用于卡片面板，浅灰 (#B3B3B3) 用于文本
- 错误色：红色 (#E91429) 用于警报提示\n- **多游戏UI专用色**：
  - 金黄色 (#FFD700) 用于金币和奖励显示
  - 橙红色 (#FF4500) 用于警告和风险提示
  - 蓝色 (#1E90FF) 用于信息和数据显示
  - 紫色 (#9370DB) 用于社交和影响相关元素
- **AI解读专用色**：
  - 深蓝色 (#1E3A8A) 用于AI解读内容背景
  - 金色 (#F59E0B) 用于付费服务标识和高级功能
  - 渐变色 (#6366F1 到 #8B5CF6) 用于AI分析进度和状态显示
  - **递减定价专用色**：橙色 (#F97316) 用于价格优惠提示
- **礼品码专用色**：
  - 彩虹渐变色 (#FF6B6B 到 #4ECDC4) 用于礼品码输入和激活界面
  - 金色 (#FFD700) 用于免费标识和礼品码权益显示
  -绿色 (#00C851) 用于礼品码激活成功提示
- **后台管理专用色**：
  - 深蓝色 (#1E40AF) 用于管理界面主色调
  - 橙色 (#F97316) 用于警告和重要操作
  - 绿色 (#059669) 用于成功状态和正向数据
  - 红色 (#DC2626) 用于危险操作和异常告警

### 5.3 视觉细节
- 按钮采用圆角设计，绿色填充配白色文字，悬停时带有微妙发光效果
- 进度条使用线性步进器以绿色显示流程阶段
- 表单输入框采用干净设计，边框最小化，单选/复选框以绿色强调
- 报告预览采用黑色背景模态框，图表使用绿色强调色
- 历史记录列表采用时间轴设计，绿色节点标记重要测试节点
- **AI解读界面设计**：
  - 付费服务入口采用金色渐变按钮，突出高级服务属性
  - **递减定价显示**：当前价格突出显示，原价划线，优惠信息用橙色标注
  - AI分析进度采用动态加载动画，配合深蓝色主题
  - AI解读内容采用独特的卡片设计，与基础报告区分
  - 支付界面采用简洁的模态框设计，支持支付宝/微信支付选择
- **礼品码界面设计**：
  - 礼品码输入框采用特殊的彩虹边框设计，突出礼品码的特殊性\n  - 免费次数显示采用金色徽章设计，实时显示剩余次数\n  - 礼品码激活成功采用庆祝动画效果\n  - 礼品码状态采用进度条显示使用情况
  - AI解读页面为礼品码用户显示'免费使用'金色按钮
- **多游戏界面设计**：
  - 游戏选择界面采用卡片网格布局，每个游戏卡片有独特的主题色
  - 气球游戏采用渐变背景，气球随扎击次数变色（绿→黄→橙→红）
  - 等待收获游戏采用农场/矿场主题，成长进度条和收益显示
  - 拍卖竞价游戏采用拍卖行界面风格，实时竞价显示
  - 双门选择游戏采用简洁的门选择界面，切换动画效果
  - 群体羊群游戏采用市场广场风格，群体指标和独立决策提示
  - 快速反应游戏采用交易界面风格，K线图和快速决策按钮
  - 所有游戏统一采用圆角按钮和阴影效果\n  - 游戏进度和得分采用动画数字效果\n- **后台管理界面设计**：\n  - 采用经典的侧边栏+主内容区布局
  - **管理员自动识别**：登录后自动检测管理员身份，无需额外认证步骤
  - 数据统计采用卡片式设计，配合图表和数字动画
  - 实时监控采用仪表盘风格，关键指标突出显示
  - 用户管理采用表格+筛选的形式，支持批量操作
  - 系统控制采用开关按钮，状态变化有明确的视觉反馈
  - **AI定价统计**：专门的定价分析图表，显示不同价格档位的转化率
  - **礼品码管理界面**：
    - 礼品码生成器采用向导式设计，步骤清晰
    - 礼品码列表采用表格设计，支持状态筛选和搜索
    - 礼品码详情采用卡片式布局，显示使用统计和用户列表
    - 批量操作采用复选框+操作栏设计\n    - 礼品码统计采用图表展示，包含使用趋势和转化分析
\n### 5.4 排版规范
- 字体：Inter或Helvetica等无衬线字体\n- 标题：粗体，24-32px\n- 正文：14-16px\n- 响应式布局，移动优先设计
- **游戏UI字体**：游戏内数字采用等宽字体，确保数字变化时布局稳定
- **AI解读字体**：AI内容采用易读的衬线字体，提升阅读体验\n- **后台管理字体**：数据展示采用等宽字体，确保对齐和可读性
- **价格显示字体**：价格数字采用醒目的粗体字体，优惠信息采用斜体
- **礼品码字体**：礼品码采用等宽字体显示，确保代码清晰可读

## 6. 一键部署与测试指南

### 6.1 环境准备
\n#### 6.1.1 系统要求
- **操作系统**：Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+ / Windows 10+
- **Node.js**：v18.0.0+
- **MongoDB**：v5.0+
- **Redis**：v6.0+
- **内存**：最小4GB，推荐8GB+
- **存储**：最小20GB可用空间
- **网络**：稳定的互联网连接\n
#### 6.1.2 必需的第三方服务账号
- **DeepSeek API**：注册并获取API密钥
- **支付宝开放平台**：商户账号和应用密钥
- **微信支付**：商户号和API证书
- **邮件服务**：SMTP服务（推荐使用腾讯企业邮箱或阿里云邮件推送）
- **CDN服务**：Cloudflare或阿里云CDN（可选，生产环境推荐）

### 6.2 一键安装脚本\n
#### 6.2.1 Linux/macOS 自动安装脚本
创建 `install.sh` 文件：
\n```bash
#!/bin/bash\n\n# 人格特质投资策略评估系统 - 一键安装脚本\n# 支持 Ubuntu/CentOS/macOS

set -e

echo '=== 人格特质投资策略评估系统 一键安装==='
echo '正在检测系统环境...'

# 检测操作系统
if [[ '$OSTYPE' == 'linux-gnu'* ]]; then\n    if [ -f /etc/ubuntu-release ] || [ -f /etc/debian_version ]; then
        OS='ubuntu'
        echo '检测到 Ubuntu/Debian 系统'\n    elif [ -f /etc/redhat-release ] || [ -f /etc/centos-release ]; then
        OS='centos'
        echo '检测到 CentOS/RHEL 系统'\n    fi
elif [[ '$OSTYPE' == 'darwin'* ]]; then
    OS='macos'
    echo '检测到 macOS 系统'
else
    echo '不支持的操作系统，请使用 Ubuntu/CentOS/macOS'\n    exit 1
fi

# 安装 Node.js
install_nodejs() {
    echo '正在安装 Node.js...'
    if [[ '$OS' == 'ubuntu' ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ '$OS' == 'centos' ]]; then\n        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    elif [[ '$OS' == 'macos' ]]; then\n        if ! command -v brew &> /dev/null; then
            echo '正在安装 Homebrew...'
            /bin/bash -c '$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)'
        fi\n        brew install node@18
    fi
}
\n# 安装 MongoDB
install_mongodb() {
    echo '正在安装 MongoDB...'
    if [[ '$OS' == 'ubuntu' ]]; then\n        wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
        echo 'deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-org
sudo systemctl start mongod
        sudo systemctl enable mongod
    elif [[ '$OS' == 'centos' ]]; then
        cat <<EOF | sudo tee /etc/yum.repos.d/mongodb-org-5.0.repo
[mongodb-org-5.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8/mongodb-org/5.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc
EOF
        sudo yum install -y mongodb-org
        sudo systemctl start mongod\n        sudo systemctl enable mongod
    elif [[ '$OS' == 'macos' ]]; then
        brew tap mongodb/brew
        brew install mongodb-community@5.0
        brew services start mongodb/brew/mongodb-community\n    fi
}

# 安装 Redis
install_redis() {
    echo '正在安装 Redis...'
    if [[ '$OS' == 'ubuntu' ]]; then
        sudo apt-get install -y redis-server
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
    elif [[ '$OS' == 'centos' ]]; then\n        sudo yum install -y redis\n        sudo systemctl start redis
        sudo systemctl enable redis
    elif [[ '$OS' == 'macos' ]]; then
        brew install redis\n        brew services start redis\n    fi
}

# 检查并安装依赖
check_and_install() {
    if ! command -v node &> /dev/null; then
        install_nodejs
    else
        echo 'Node.js 已安装: '$(node --version)\n    fi

    if ! command -v mongod &> /dev/null; then\n        install_mongodb
    else\n        echo 'MongoDB 已安装'\n    fi

    if ! command -v redis-server &> /dev/null && ! command -v redis &> /dev/null; then
        install_redis
    else
        echo 'Redis 已安装'
    fi
}\n
# 克隆项目代码
clone_project() {\n    echo '正在下载项目代码...'
    if [ -d 'personality-investment-system' ]; then\n        echo '项目目录已存在，正在更新...'
        cd personality-investment-system
        git pull\n    else
        git clone https://github.com/your-repo/personality-investment-system.git
        cd personality-investment-system
    fi
}

# 安装项目依赖\ninstall_dependencies() {
    echo '正在安装项目依赖...'
    \n    # 安装后端依赖\n    echo '安装后端依赖...'
    cd backend
    npm install
    \n    # 安装前端依赖
    echo '安装前端依赖...'\n    cd ../frontend
    npm install
    
    cd ..
}\n
# 配置环境变量
setup_environment() {
    echo '正在配置环境变量...'
    \n    if [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
echo '已创建后端环境配置文件: backend/.env'
echo '请编辑该文件并填入必要的配置信息'
    fi
    
    if [ ! -f frontend/.env ]; then
        cp frontend/.env.example frontend/.env\n        echo '已创建前端环境配置文件: frontend/.env'\n    fi
}

# 初始化数据库
init_database() {
    echo '正在初始化数据库...'\n    cd backend
    npm run db:init
    cd ..
}\n
# 构建前端
build_frontend() {
    echo '正在构建前端...'
    cd frontend
    npm run build
    cd ..
}

# 主安装流程
main() {
    check_and_install\n    clone_project
    install_dependencies
    setup_environment
    \n    echo ''\n    echo '=== 安装完成 ==='
    echo ''\n    echo '下一步操作：'
    echo '1. 编辑配置文件：'
    echo '   - backend/.env (后端配置)'
    echo '   - frontend/.env (前端配置)'
    echo ''\n    echo '2. 初始化数据库：'
    echo '   cd backend && npm run db:init'
    echo ''\n    echo '3. 启动服务：'
    echo '   ./start.sh'
    echo ''
    echo '4. 访问系统：'
    echo '   前端: http://localhost:3000'
    echo '   后台: http://localhost:3000/admin'
    echo 'API: http://localhost:5000/api/v1'
    echo ''
}\n
main\n```

#### 6.2.2 Windows PowerShell 安装脚本
创建 `install.ps1` 文件：
\n```powershell
# 人格特质投资策略评估系统 - Windows一键安装脚本
\nWrite-Host '=== 人格特质投资策略评估系统 一键安装 ===' -ForegroundColor Green
Write-Host '正在检测系统环境...' -ForegroundColor Yellow
\n# 检查管理员权限\nif (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]'Administrator')) {\n    Write-Host '请以管理员身份运行此脚本' -ForegroundColor Red
    exit 1
}

# 安装 Chocolatey\nfunction Install-Chocolatey {
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host '正在安装 Chocolatey...' -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072\n        iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    }\n}

# 安装 Node.js
function Install-NodeJS {
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host '正在安装 Node.js...' -ForegroundColor Yellow
        choco install nodejs -y
    } else {
        Write-Host 'Node.js 已安装: ' -NoNewline
        node --version
    }
}

# 安装 MongoDB
function Install-MongoDB {
    if (!(Get-Service MongoDB -ErrorAction SilentlyContinue)) {
        Write-Host '正在安装 MongoDB...' -ForegroundColor Yellow\n        choco install mongodb -y
        Start-Service MongoDB
    } else {\n        Write-Host 'MongoDB 已安装'\n    }
}

# 安装 Redis
function Install-Redis {
    if (!(Get-Command redis-server -ErrorAction SilentlyContinue)) {
        Write-Host '正在安装 Redis...' -ForegroundColor Yellow\n        choco install redis-64 -y
    } else {
        Write-Host 'Redis 已安装'
    }
}
\n# 安装 Git
function Install-Git {
    if (!(Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host '正在安装 Git...' -ForegroundColor Yellow
        choco install git -y
    }
}
\n# 主安装流程\nfunction Main {\n    Install-Chocolatey
    Install-NodeJS
    Install-MongoDB
    Install-Redis\n    Install-Git
    
    #刷新环境变量
    $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
    
    # 克隆项目\n    Write-Host '正在下载项目代码...' -ForegroundColor Yellow\n    if (Test-Path 'personality-investment-system') {
        Set-Location 'personality-investment-system'\n        git pull\n    } else {
        git clone https://github.com/your-repo/personality-investment-system.git
        Set-Location 'personality-investment-system'\n    }
    
    # 安装依赖
    Write-Host '正在安装项目依赖...' -ForegroundColor Yellow
    Set-Location 'backend'
    npm install
    Set-Location '../frontend'
    npm install
    Set-Location '..'
    \n    # 配置环境变量
    if (!(Test-Path 'backend/.env')) {
        Copy-Item 'backend/.env.example' 'backend/.env'
        Write-Host '已创建后端环境配置文件: backend/.env' -ForegroundColor Green
    }
    
    if (!(Test-Path 'frontend/.env')) {\n        Copy-Item 'frontend/.env.example' 'frontend/.env'
        Write-Host '已创建前端环境配置文件: frontend/.env' -ForegroundColor Green
    }
    \n    Write-Host ''
    Write-Host '=== 安装完成 ===' -ForegroundColor Green
    Write-Host ''
    Write-Host '下一步操作：' -ForegroundColor Yellow
    Write-Host '1. 编辑配置文件：backend/.env 和 frontend/.env'\n    Write-Host '2. 初始化数据库：cd backend && npm run db:init'
    Write-Host '3. 启动服务：./start.ps1'
    Write-Host '4. 访问系统：http://localhost:3000'
}

Main
```

### 6.3 环境配置文件\n
#### 6.3.1 后端环境配置 (backend/.env.example)
```bash
# 基础配置
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# 数据库配置\nMONGODB_URI=mongodb://localhost:27017/personality_investment\nREDIS_URL=redis://localhost:6379
\n# JWT 配置
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# 管理员配置\nADMIN_EMAIL=admin@yourdomain.com\n
# 邮件服务配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your_email@qq.com
SMTP_PASS=your_email_password
FROM_EMAIL=your_email@qq.com
FROM_NAME=人格特质投资策略评估系统

# DeepSeek AI 配置
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat\n\n# 支付配置
# 支付宝\nALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY=your_alipay_private_key
ALIPAY_PUBLIC_KEY=your_alipay_public_key
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do

# 微信支付
WECHAT_APP_ID=your_wechat_app_id
WECHAT_MCH_ID=your_wechat_mch_id\nWECHAT_API_KEY=your_wechat_api_key
WECHAT_CERT_PATH=./certs/wechat_cert.p12

# 安全配置
ENCRYPTION_KEY=your_32_character_encryption_key
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# 文件存储配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760\n
# 日志配置\nLOG_LEVEL=info\nLOG_FILE=./logs/app.log
\n# CDN 配置（可选）
CDN_URL=https://your-cdn-domain.com\nCLOUDFLARE_API_KEY=your_cloudflare_api_key
CLOUDFLARE_EMAIL=your_cloudflare_email

# 监控配置（可选）
SENTRY_DSN=your_sentry_dsn\nNEW_RELIC_LICENSE_KEY=your_new_relic_key
```

#### 6.3.2 前端环境配置 (frontend/.env.example)
```bash
# API 配置
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_WS_URL=ws://localhost:5000\n
# 应用配置
REACT_APP_NAME=人格特质投资策略评估系统\nREACT_APP_VERSION=1.0.0\nREACT_APP_DESCRIPTION=专业的投资心理评估平台

# 支付配置
REACT_APP_ALIPAY_APP_ID=your_alipay_app_id
REACT_APP_WECHAT_APP_ID=your_wechat_app_id

# 第三方服务\nREACT_APP_GOOGLE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id

# CDN 配置\nREACT_APP_CDN_URL=https://your-cdn-domain.com

# 功能开关
REACT_APP_ENABLE_GAMES=true
REACT_APP_ENABLE_AI_ANALYSIS=true
REACT_APP_ENABLE_GIFT_CODES=true
REACT_APP_ENABLE_PAYMENTS=true

# 调试配置
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=warn
```

### 6.4 启动脚本\n
#### 6.4.1 Linux/macOS 启动脚本(start.sh)\n```bash
#!/bin/bash\n
# 人格特质投资策略评估系统 - 启动脚本\n
set -e
\necho '=== 启动人格特质投资策略评估系统 ==='

# 检查环境配置
check_config() {
    if [ ! -f backend/.env ]; then
        echo '错误: 后端环境配置文件不存在，请先运行 ./install.sh'
        exit 1
    fi
    
    if [ ! -f frontend/.env ]; then\n        echo '错误: 前端环境配置文件不存在，请先运行 ./install.sh'\n        exit 1
    fi\n}\n
# 检查服务状态
check_services() {
    echo '检查服务状态...'
    
    # 检查MongoDB
    if ! pgrep mongod > /dev/null; then
        echo '启动 MongoDB...'\n        if [[ '$OSTYPE' == 'darwin'* ]]; then
            brew services start mongodb/brew/mongodb-community
        else\n            sudo systemctl start mongod
        fi
    fi
    \n    # 检查 Redis
    if ! pgrep redis > /dev/null; then
        echo '启动 Redis...'
        if [[ '$OSTYPE' == 'darwin'* ]]; then
            brew services start redis
        else
            sudo systemctl start redis
        fi\n    fi
}\n
# 初始化数据库（如果需要）
init_db() {
    echo '检查数据库初始化状态...'
    cd backend
    if ! npm run db:check > /dev/null 2>&1; then
        echo '初始化数据库...'
        npm run db:init
    fi
    cd ..
}

# 启动后端服务
start_backend() {
    echo '启动后端服务...'
    cd backend
    \n    # 检查是否已安装依赖\n    if [ ! -d node_modules ]; then
        echo '安装后端依赖...'
        npm install
    fi\n    
    # 启动后端（开发模式）\n    if [ '$1' = 'dev' ]; then
        npm run dev &
    else
        npm start &
    fi\n    
    BACKEND_PID=$!
    echo '后端服务已启动 (PID: '$BACKEND_PID')'
    cd ..
}

# 启动前端服务
start_frontend() {
    echo '启动前端服务...'\n    cd frontend\n    
    # 检查是否已安装依赖
    if [ ! -d node_modules ]; then
        echo '安装前端依赖...'\n        npm install\n    fi
    
    # 启动前端\n    if [ '$1' = 'dev' ]; then
        npm start &
    else\n        # 生产模式：构建并使用 serve\n        if [ ! -d build ]; then\n            echo '构建前端...'
            npm run build
        fi
        npx serve -s build -l 3000 &
    fi\n    
    FRONTEND_PID=$!
    echo '前端服务已启动 (PID: '$FRONTEND_PID')'
    cd ..
}
\n# 等待服务启动
wait_for_services() {
    echo '等待服务启动...'\n    sleep 5
    
    # 检查后端\n    if curl -f http://localhost:5000/api/v1/health > /dev/null 2>&1; then
        echo '✓ 后端服务运行正常'
    else
        echo '✗ 后端服务启动失败'
        exit 1\n    fi
    
    # 检查前端
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo '✓ 前端服务运行正常'
    else
        echo '✗ 前端服务启动失败'
        exit 1\n    fi
}

# 显示访问信息
show_info() {
    echo ''
    echo '=== 系统启动成功 ==='
    echo ''
    echo '访问地址：'\n    echo '  前端应用: http://localhost:3000'
    echo '  管理后台: http://localhost:3000/admin'
    echo '  API 接口: http://localhost:5000/api/v1'
    echo '  API 文档: http://localhost:5000/api/docs'
    echo ''
    echo '默认管理员账号：请使用配置的 ADMIN_EMAIL 注册'
    echo ''
    echo '停止服务：Ctrl+C 或运行 ./stop.sh'
    echo '查看日志：./logs.sh'
    echo ''
}\n
# 信号处理
trap 'echo \"正在停止服务...\"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT TERM
\n# 主启动流程
main() {
    check_config
    check_services
    init_db
    start_backend $1
    start_frontend $1\n    wait_for_services
    show_info
    \n    # 保持脚本运行\n    wait
}
\n# 检查参数
if [ '$1' = '--help' ] || [ '$1' = '-h' ]; then
    echo '用法: ./start.sh [dev|prod]'
    echo '  dev:  开发模式（热重载）'
    echo '  prod: 生产模式（默认）'
    exit 0
fi

main $1
```

#### 6.4.2 Windows PowerShell 启动脚本 (start.ps1)\n```powershell
# 人格特质投资策略评估系统 - Windows启动脚本

Write-Host '=== 启动人格特质投资策略评估系统 ===' -ForegroundColor Green
\n# 检查配置文件
function Check-Config {
    if (!(Test-Path 'backend/.env')) {
        Write-Host '错误: 后端环境配置文件不存在，请先运行 ./install.ps1' -ForegroundColor Red
        exit 1\n    }
    
    if (!(Test-Path 'frontend/.env')) {
        Write-Host '错误: 前端环境配置文件不存在，请先运行 ./install.ps1' -ForegroundColor Red
        exit 1
    }
}\n
# 检查并启动服务\nfunction Start-Services {
    Write-Host '检查并启动必要服务...' -ForegroundColor Yellow
    \n    # 启动 MongoDB
    try {
        Start-Service MongoDB -ErrorAction Stop\n        Write-Host '✓ MongoDB 服务已启动' -ForegroundColor Green
    } catch {
        Write-Host '✗ MongoDB 启动失败，请检查安装' -ForegroundColor Red
        exit 1\n    }
    
    # 启动 Redis
    try {
        Start-Process redis-server -WindowStyle Hidden\n        Write-Host '✓ Redis 服务已启动' -ForegroundColor Green
    } catch {\n        Write-Host '✗ Redis 启动失败，请检查安装' -ForegroundColor Red
        exit 1\n    }
}\n
# 初始化数据库
function Initialize-Database {
    Write-Host '检查数据库初始化状态...' -ForegroundColor Yellow
    Set-Location'backend'
    
    try {
        npm run db:check2>$null\n    } catch {
        Write-Host '初始化数据库...' -ForegroundColor Yellow
        npm run db:init\n    }

    Set-Location '..'
}

# 启动后端\nfunction Start-Backend($Mode) {
    Write-Host '启动后端服务...' -ForegroundColor Yellow
    Set-Location 'backend'
    
    if (!(Test-Path 'node_modules')) {
        Write-Host '安装后端依赖...' -ForegroundColor Yellow
        npm install
    }
    \n    if ($Mode -eq 'dev') {
        Start-Process powershell -ArgumentList '-Command', 'npm run dev' -WindowStyle Normal\n    } else {
        Start-Process powershell -ArgumentList '-Command', 'npm start' -WindowStyle Normal
    }\n    
    Set-Location '..'
    Write-Host '✓ 后端服务已启动' -ForegroundColor Green
}\n
# 启动前端\nfunction Start-Frontend($Mode) {
    Write-Host '启动前端服务...' -ForegroundColor Yellow\n    Set-Location 'frontend'
    
    if (!(Test-Path 'node_modules')) {
        Write-Host '安装前端依赖...' -ForegroundColor Yellow\n        npm install\n    }
    
    if ($Mode -eq 'dev') {\n        Start-Process powershell -ArgumentList '-Command', 'npm start' -WindowStyle Normal
    } else {
        if (!(Test-Path 'build')) {
            Write-Host '构建前端...' -ForegroundColor Yellow
            npm run build
        }
        Start-Process powershell -ArgumentList '-Command', 'npx serve -s build -l 3000' -WindowStyle Normal
    }\n    
    Set-Location '..'
    Write-Host '✓ 前端服务已启动' -ForegroundColor Green
}
\n# 等待并检查服务
function Wait-ForServices {
    Write-Host '等待服务启动...' -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    try {
        Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/health' -Method Get -TimeoutSec 5
        Write-Host '✓ 后端服务运行正常' -ForegroundColor Green\n    } catch {
        Write-Host '✗ 后端服务启动失败' -ForegroundColor Red
        return $false
    }
    
    try {
        Invoke-WebRequest -Uri 'http://localhost:3000' -Method Get -TimeoutSec 5
        Write-Host '✓ 前端服务运行正常' -ForegroundColor Green
    } catch {
        Write-Host '✗ 前端服务启动失败' -ForegroundColor Red
        return $false\n    }
    
    return $true
}\n
# 显示访问信息
function Show-Info {
    Write-Host ''
    Write-Host '=== 系统启动成功 ===' -ForegroundColor Green
    Write-Host ''
    Write-Host '访问地址：' -ForegroundColor Yellow
    Write-Host '  前端应用: http://localhost:3000'\n    Write-Host '  管理后台: http://localhost:3000/admin'
    Write-Host '  API 接口: http://localhost:5000/api/v1'\n    Write-Host '  API 文档: http://localhost:5000/api/docs'
    Write-Host ''\n    Write-Host '默认管理员账号：请使用配置的 ADMIN_EMAIL 注册' -ForegroundColor Cyan
    Write-Host ''
    Write-Host '停止服务：运行 ./stop.ps1' -ForegroundColor Yellow
    Write-Host '查看日志：运行 ./logs.ps1' -ForegroundColor Yellow
Write-Host ''\n}

# 主函数
function Main($Mode) {
    Check-Config
    Start-Services
    Initialize-Database
    Start-Backend $Mode
    Start-Frontend $Mode\n    \n    if (Wait-ForServices) {
        Show-Info
        
        # 自动打开浏览器
        Start-Process 'http://localhost:3000'\n        
        Write-Host '按任意键退出...' -ForegroundColor Yellow\n        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    } else {
        Write-Host '服务启动失败，请检查日志' -ForegroundColor Red
exit 1
    }
}\n
# 参数处理
if ($args[0] -eq '--help' -or $args[0] -eq '-h') {
    Write-Host '用法: ./start.ps1 [dev|prod]'
    Write-Host '  dev:  开发模式（热重载）'
    Write-Host '  prod: 生产模式（默认）'
    exit 0
}

Main $args[0]\n```
\n### 6.5 数据库初始化脚本\n\n#### 6.5.1 数据库初始化(backend/scripts/init-db.js)
```javascript\n// 数据库初始化脚本
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// 连接数据库
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ 数据库连接成功');
    } catch (error) {
        console.error('✗ 数据库连接失败:', error.message);
        process.exit(1);
    }
};

// 创建索引
const createIndexes = async () => {
    console.log('创建数据库索引...');
    \n    const db = mongoose.connection.db;
    \n    // 用户集合索引
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ isAdmin: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    
    // 测试记录索引
    await db.collection('tests').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('tests').createIndex({ testType: 1 });
    
    // 支付订单索引
    await db.collection('payments').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('payments').createIndex({ orderId: 1 }, { unique: true });
    await db.collection('payments').createIndex({ status: 1 });
    
    //礼品码索引
    await db.collection('giftcodes').createIndex({ code: 1 }, { unique: true });
    await db.collection('giftcodes').createIndex({ status: 1 });
    await db.collection('giftcodes').createIndex({ createdAt: -1 });
    
    // AI解读记录索引
    await db.collection('aianalyses').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('aianalyses').createIndex({ analysisId: 1 }, { unique: true });
    \n    // 系统日志索引
    await db.collection('logs').createIndex({ timestamp: -1 });
    await db.collection('logs').createIndex({ level: 1 });
    await db.collection('logs').createIndex({ userId: 1 });
    
    console.log('✓ 数据库索引创建完成');\n};
\n// 创建默认数据\nconst createDefaultData = async () => {
    console.log('创建默认数据...');
    \n    const db = mongoose.connection.db;
    
    // 创建系统配置
    const systemConfig = {\n        _id: 'system_config',
        paymentEnabled: true,
        giftCodeEnabled: true,\n        registrationEnabled: true,
        maintenanceMode: false,
        aiPricing: {
            firstPurchase: 3.99,
            secondPurchase: 2.99,
            subsequentPurchase: 0.99
        },
        giftCodeSettings: {
            defaultUses: 15,
            maxLength: 10,
            allowMultiUser: true
        },
        securitySettings: {\n            maxLoginAttempts: 5,
            lockoutDuration: 3600000, // 1 hour
            rateLimitWindow: 900000, // 15 minutes
            rateLimitMax: 100\n        },
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    await db.collection('configs').replaceOne(\n        { _id: 'system_config' },
        systemConfig,
        { upsert: true }
    );\n    
    // 创建默认游戏配置
    const gameConfigs = [
{
            _id: 'balloon_risk',
            name: '气球风险游戏',
            enabled: true,
            settings: {
                rounds: 5,\n                coinsPerPop: 10,\n                minBurstPoint: 8,
                maxBurstPoint: 25\n            }
        },\n        {
            _id: 'waiting_harvest',
            name: '等待收获游戏',
            enabled: true,
            settings: {
                initialInvestment: 100,
                minCycle: 10,
                maxCycle: 30,
                growthRateMin: 0.05,
                growthRateMax: 0.15\n            }
        },
        {
            _id: 'auction_bidding',
            name: '拍卖竞价游戏',\n            enabled: true,
            settings: {
                startingPrice: 10,
                minIncrement: 5,
                rounds: 5\n            }
        },
        {
            _id: 'double_door',
            name: '双门选择游戏',
            enabled: true,
            settings: {
                safeReward: 20,
                riskReward: 50,
                riskPenalty: -30,
                rounds: 10
            }\n        },
        {\n            _id: 'herd_behavior',
            name: '群体羊群游戏',
            enabled: true,
            settings: {\n                initialCoins: 100,
                rounds: 8\n            }
        },
        {\n            _id: 'quick_reaction',
            name: '快速反应游戏',
            enabled: true,
            settings: {
                timeLimit: 10000, // 10 seconds
                correctReward: 10,
                incorrectPenalty: -5,
                rounds: 15
            }\n        }
    ];
    
    for (const config of gameConfigs) {\n        await db.collection('gameconfigs').replaceOne(
            { _id: config._id },
            config,
            { upsert: true }
        );
    }
    \n    console.log('✓ 默认数据创建完成');\n};
\n// 创建示例礼品码
const createSampleGiftCodes = async () => {
    console.log('创建示例礼品码...');
    
    const db = mongoose.connection.db;
    \n    const sampleGiftCodes = [
        {
            code: 'WELCOME2024',
            status: 'active',
            totalUses: 15,
            remainingUses: 15,
            activatedUsers: [],
            createdBy: process.env.ADMIN_EMAIL || 'system',
            createdAt: new Date(),
            settings: {
                multiUser: true,\n                maxUsers: 1000,
                description: '新用户欢迎礼品码'\n            },
            stats: {
                totalActivations: 0,\n                totalUsages: 0,
                conversionRate: 0\n            }
        },
        {
            code: 'TEST123',
            status: 'active',
            totalUses: 15,
            remainingUses: 15,
            activatedUsers: [],
            createdBy: process.env.ADMIN_EMAIL || 'system',
            createdAt: new Date(),
            settings: {
                multiUser: true,\n                maxUsers: 100,
                description: '测试用礼品码'
            },
            stats: {
                totalActivations: 0,
                totalUsages: 0,
                conversionRate: 0
            }
        }
    ];\n    
    for (const giftCode of sampleGiftCodes) {
        await db.collection('giftcodes').replaceOne(
            { code: giftCode.code },\n            giftCode,
            { upsert: true }
        );
    }\n    
    console.log('✓ 示例礼品码创建完成');\n    console.log('  - WELCOME2024: 新用户欢迎礼品码');
    console.log('  - TEST123: 测试用礼品码');
};\n
// 验证配置
const validateConfig = () => {
    console.log('验证环境配置...');
    
    const requiredEnvVars = [
        'MONGODB_URI',\n        'JWT_SECRET',
        'ADMIN_EMAIL',
        'SMTP_HOST',
        'SMTP_USER',
        'SMTP_PASS'\n    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {\n        console.error('✗ 缺少必要的环境变量:');
        missingVars.forEach(varName => {
            console.error(`  - ${varName}`);\n        });
        console.error('请检查 .env 文件配置');
        process.exit(1);
    }
    
    console.log('✓ 环境配置验证通过');
};

// 主初始化函数\nconst initializeDatabase = async () => {
    try {
        console.log('=== 数据库初始化开始 ===');
        
        validateConfig();
        await connectDB();
        await createIndexes();\n        await createDefaultData();
        await createSampleGiftCodes();
        
        console.log('=== 数据库初始化完成 ===');\n        console.log('');
        console.log('下一步：');\n        console.log('1. 启动服务：npm start 或 npm run dev');
        console.log('2. 访问前端：http://localhost:3000');\n        console.log('3. 使用管理员邮箱注册获得管理员权限');
        console.log('4. 测试礼品码：WELCOME2024 或 TEST123');\n        console.log('');
        
    } catch (error) {
        console.error('✗ 数据库初始化失败:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
};\n
// 检查数据库状态
const checkDatabase = async () => {
    try {
        await connectDB();
        \n        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();\n        const configExists = collections.some(col => col.name === 'configs');
        
        if (configExists) {
            const config = await db.collection('configs').findOne({ _id: 'system_config' });
            if (config) {\n                console.log('✓ 数据库已初始化');\n                process.exit(0);
            }\n        }
        
        console.log('✗ 数据库未初始化');
        process.exit(1);\n        
    } catch (error) {
        console.error('✗ 数据库检查失败:', error.message);\n        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
};\n
// 命令行参数处理
const command = process.argv[2];

if (command === 'check') {
    checkDatabase();
} else {
    initializeDatabase();
}\n```

### 6.6 测试脚本\n
#### 6.6.1 自动化测试脚本 (test.sh)
```bash
#!/bin/bash
\n# 人格特质投资策略评估系统 - 自动化测试脚本
\nset -e
\necho '=== 系统自动化测试 ==='

# 测试配置
BASE_URL='http://localhost:5000/api/v1'
FRONTEND_URL='http://localhost:3000'
TEST_EMAIL='test@example.com'
ADMIN_EMAIL=${ADMIN_EMAIL:-'admin@example.com'}
TEST_GIFT_CODE='TEST123'

# 颜色定义
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0\nFAILED_TESTS=0

# 测试函数
test_api() {
    local test_name='$1'
    local url='$2'
    local method='${3:-GET}'\n    local data='$4'
    local expected_status='${5:-200}'
    \n    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n \"测试 $TOTAL_TESTS: $test_name ... \"
    \n    if [ '$method' = 'POST' ] && [ -n '$data' ]; then
        response=$(curl -s -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '$data' '$url')
    else
        response=$(curl -s -w '%{http_code}' '$url')
    fi
    
    status_code=${response: -3}
    
    if [ '$status_code' = '$expected_status' ]; then
        echo -e '${GREEN}✓ 通过${NC}'
        PASSED_TESTS=$((PASSED_TESTS + 1))\n        return 0
    else
        echo -e '${RED}✗ 失败 (状态码: $status_code)${NC}'
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}\n
# 等待服务启动
wait_for_services() {
    echo '等待服务启动...'
    \n    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f '$BASE_URL/health' > /dev/null 2>&1; then
            echo '✓ 后端服务已就绪'\n            break
        fi\n        
        echo \"等待后端服务启动... ($attempt/$max_attempts)\"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo '✗ 后端服务启动超时'
        exit 1
    fi
    
    # 等待前端服务\n    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f '$FRONTEND_URL' > /dev/null 2>&1; then
            echo '✓ 前端服务已就绪'
            break
        fi
        \n        echo \"等待前端服务启动... ($attempt/$max_attempts)\"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo '✗ 前端服务启动超时'
        exit 1\n    fi
}

# 基础 API 测试\ntest_basic_apis() {
    echo ''\n    echo '=== 基础 API 测试 ==='
    \n    test_api '健康检查' '$BASE_URL/health'\n    test_api '获取验证码' '$BASE_URL/auth/captcha'
    test_api '系统配置' '$BASE_URL/config/public'
    test_api '游戏列表' '$BASE_URL/games/list'
}\n
# 认证功能测试
test_auth_functions() {
    echo ''
    echo '=== 认证功能测试 ==='\n    
    # 发送验证码测试
    local captcha_data='{\"email\":\"'$TEST_EMAIL'\",\"captcha\":\"test\"}'
    test_api '发送验证码' '$BASE_URL/auth/send-code''POST' '$captcha_data' '200'
    \n    # 验证码登录测试（预期失败）\n    local login_data='{\"email\":\"'$TEST_EMAIL'\",\"code\":\"123456\"}'
    test_api '验证码登录（无效验证码）' '$BASE_URL/auth/verify-code' 'POST' '$login_data' '400'
}\n
# 礼品码功能测试
test_gift_code_functions() {\n    echo ''
    echo '=== 礼品码功能测试 ==='
    
    # 验证礼品码\n    local gift_code_data='{\"code\":\"'$TEST_GIFT_CODE'\"}'
    test_api '验证礼品码' '$BASE_URL/giftcode/validate' 'POST' '$gift_code_data'\n    
    # 激活礼品码（需要认证，预期失败）
    test_api '激活礼品码（未认证）' '$BASE_URL/giftcode/activate' 'POST' '$gift_code_data' '401'
}\n
# 支付功能测试
test_payment_functions() {
    echo ''
    echo '=== 支付功能测试 ==='
    
    # 获取 AI 解读价格（需要认证，预期失败）
    test_api '获取AI解读价格（未认证）' '$BASE_URL/ai/deepseek/price' 'GET' '' '401'
    
    # 创建支付订单（需要认证，预期失败）
    local payment_data='{\"amount\":3.99,\"type\":\"ai_analysis\"}'
    test_api '创建支付订单（未认证）' '$BASE_URL/payment/create-order' 'POST' '$payment_data' '401'
}

# 游戏功能测试
test_game_functions() {
    echo ''
    echo '=== 游戏功能测试 ==='
    
    # 提交游戏数据（需要认证，预期失败）
    local balloon_data='{\"rounds\":[{\"pops\":5,\"coins\":50,\"burst\":false}],\"totalCoins\":50}'\n    test_api '提交气球游戏数据（未认证）' '$BASE_URL/games/balloon-risk' 'POST' '$balloon_data' '401'
}\n
# 管理员功能测试
test_admin_functions() {
    echo ''
    echo '=== 管理员功能测试 ==='
    
    # 检查管理员权限（需要认证，预期失败）
    test_api '检查管理员权限（未认证）' '$BASE_URL/admin/check-permission' 'GET' '' '401'\n    
    # 获取统计数据（需要认证，预期失败）
    test_api '获取统计数据（未认证）' '$BASE_URL/admin/dashboard/stats' 'GET' '' '401'\n    
    # 生成礼品码（需要认证，预期失败）\n    local generate_data='{\"count\":1,\"length\":8}'
    test_api '生成礼品码（未认证）' '$BASE_URL/admin/giftcode/generate' 'POST' '$generate_data' '401'\n}

# 前端页面测试
test_frontend_pages() {
    echo ''
    echo '=== 前端页面测试 ==='\n    
    test_api '首页' '$FRONTEND_URL'
    test_api '登录页面' '$FRONTEND_URL/login'
    test_api '测试页面' '$FRONTEND_URL/test'
    test_api '管理后台' '$FRONTEND_URL/admin'\n}

# 性能测试
test_performance() {
    echo ''
    echo '=== 性能测试 ==='
    
    echo -n '测试 API 响应时间 ... '\n    local start_time=$(date +%s%N)
    curl -s '$BASE_URL/health' > /dev/null
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ $duration -lt 1000 ]; then\n        echo -e '${GREEN}✓ 通过 ('$duration'ms)${NC}'
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e '${RED}✗ 失败 ('$duration'ms > 1000ms)${NC}'\n        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}\n
# 安全测试
test_security() {
    echo ''
    echo '=== 安全测试 ==='
    
    # SQL 注入测试
    local sql_injection=\"'; DROP TABLE users; --\"
    local injection_data='{\"email\":\"'$sql_injection'\",\"code\":\"123456\"}'
    test_api 'SQL注入防护测试' '$BASE_URL/auth/verify-code' 'POST' '$injection_data' '400'\n    
    # XSS 测试
    local xss_payload='<script>alert(\"xss\")</script>'
    local xss_data='{\"email\":\"'$xss_payload'\",\"code\":\"123456\"}'
    test_api 'XSS防护测试' '$BASE_URL/auth/verify-code' 'POST' '$xss_data' '400'
    
    # 频率限制测试
    echo -n '测试频率限制 ... '
    local rate_limit_passed=true
    \n    for i in {1..10}; do
        response=$(curl -s -w '%{http_code}' '$BASE_URL/health')
        status_code=${response: -3}\n        if [ '$status_code' != '200' ]; then
            rate_limit_passed=false
            break
        fi\n    done
    \n    if [ '$rate_limit_passed' = true ]; then
        echo -e '${GREEN}✓ 通过${NC}'
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e '${RED}✗ 失败${NC}'\n        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# 数据库连接测试
test_database_connection() {
    echo ''
    echo '=== 数据库连接测试 ==='
    \n    echo -n '测试MongoDB 连接 ... '
    if mongo --eval'db.runCommand(\"ping\").ok' > /dev/null 2>&1; then
        echo -e '${GREEN}✓ 通过${NC}'
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e '${RED}✗ 失败${NC}'\n        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n '测试 Redis 连接 ... '
    if redis-cli ping > /dev/null 2>&1; then\n        echo -e '${GREEN}✓ 通过${NC}'
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e '${RED}✗ 失败${NC}'
        FAILED_TESTS=$((FAILED_TESTS + 1))\n    fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# 生成测试报告\ngenerate_report() {
    echo ''
    echo '=== 测试报告 ==='
    echo \"总测试数: $TOTAL_TESTS\"
    echo -e \"通过: ${GREEN}$PASSED_TESTS${NC}\"
    echo -e \"失败: ${RED}$FAILED_TESTS${NC}\"
    \n    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo \"成功率: $success_rate%\"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e '${GREEN}🎉 所有测试通过！系统运行正常。${NC}'
        return 0
    else
        echo -e '${YELLOW}⚠️  部分测试失败，请检查系统配置。${NC}'
        return 1
    fi
}
\n# 主测试流程
main() {
    echo '开始系统测试...'
    echo '测试目标: '$BASE_URL\n    echo '前端地址: '$FRONTEND_URL
    echo ''\n    
    wait_for_services\n    test_database_connection
    test_basic_apis
    test_auth_functions
    test_gift_code_functions
    test_payment_functions
    test_game_functions
    test_admin_functions\n    test_frontend_pages
    test_performance
    test_security\n    
    generate_report
}

# 检查参数
if [ '$1' = '--help' ] || [ '$1' = '-h' ]; then
    echo '用法: ./test.sh [options]'
    echo '选项:'
    echo '  --api-only仅测试 API 接口'\n    echo '  --frontend-only    仅测试前端页面'
    echo '  --security-only    仅测试安全功能'
    echo '  --performance-only 仅测试性能'
    echo '  --help, -h    显示帮助信息'
    exit 0
fi

# 根据参数执行特定测试
case '$1' in
    --api-only)
        wait_for_services\n        test_basic_apis
        test_auth_functions
        test_gift_code_functions\n        test_payment_functions
        test_game_functions
        test_admin_functions
        generate_report
        ;;
    --frontend-only)
        wait_for_services
        test_frontend_pages
        generate_report
        ;;
    --security-only)
        wait_for_services
        test_security
        generate_report
        ;;
    --performance-only)
        wait_for_services
        test_performance
        generate_report
        ;;
    *)
        main
        ;;\nesac

exit $?
```

### 6.7 日志查看脚本
\n#### 6.7.1 日志查看脚本 (logs.sh)
```bash
#!/bin/bash
\n# 日志查看脚本
\necho '=== 系统日志查看==='

# 显示菜单
show_menu() {\n    echo ''\n    echo '请选择要查看的日志:'
    echo '1. 后端应用日志'\n    echo '2. 前端构建日志'
    echo '3. MongoDB 日志'
    echo '4. Redis 日志'\n    echo '5. 系统错误日志'
    echo '6. 访问日志'
    echo '7. 安全日志'
    echo '8. 支付日志'
    echo '9. AI 服务日志'
    echo '10. 实时日志监控'
    echo '0. 退出'
    echo ''\n    read -p '请输入选项 (0-10): ' choice
}\n
# 查看后端日志
view_backend_logs() {
    echo '=== 后端应用日志 ==='
    if [ -f backend/logs/app.log ]; then
        tail -n 50 backend/logs/app.log
    else
        echo '日志文件不存在: backend/logs/app.log'
    fi
}

# 查看前端日志
view_frontend_logs() {
    echo '=== 前端构建日志 ==='
    if [ -f frontend/build.log ]; then\n        tail -n 50 frontend/build.log
    else
        echo '日志文件不存在: frontend/build.log'
    fi\n}

# 查看 MongoDB 日志\nview_mongodb_logs() {
    echo '=== MongoDB 日志 ==='
    if [[ '$OSTYPE' == 'darwin'* ]]; then
        tail -n 50 /usr/local/var/log/mongodb/mongo.log 2>/dev/null || echo 'MongoDB 日志文件不存在'\n    else
        sudo tail -n 50 /var/log/mongodb/mongod.log 2>/dev/null || echo 'MongoDB 日志文件不存在'
    fi
}

# 查看 Redis 日志
view_redis_logs() {
    echo '=== Redis 日志 ==='\n    if [[ '$OSTYPE' == 'darwin'* ]]; then\n        tail -n 50 /usr/local/var/log/redis.log 2>/dev/null || echo 'Redis 日志文件不存在'
    else\n        sudo tail -n 50 /var/log/redis/redis-server.log 2>/dev/null || echo 'Redis 日志文件不存在'\n    fi
}

# 查看错误日志
view_error_logs() {
    echo '=== 系统错误日志 ==='\n    if [ -f backend/logs/error.log ]; then
        tail -n 50 backend/logs/error.log
    else
        echo '错误日志文件不存在: backend/logs/error.log'
    fi
}
\n# 查看访问日志
view_access_logs() {
    echo '=== 访问日志 ==='
    if [ -f backend/logs/access.log ]; then
        tail -n 50 backend/logs/access.log
    else
        echo '访问日志文件不存在: backend/logs/access.log'
    fi
}

# 查看安全日志
view_security_logs() {\n    echo '=== 安全日志 ==='\n    if [ -f backend/logs/security.log ]; then
        tail -n 50 backend/logs/security.log
    else
        echo '安全日志文件不存在: backend/logs/security.log'
    fi
}\n
# 查看支付日志
view_payment_logs() {
    echo '=== 支付日志 ==='
    if [ -f backend/logs/payment.log ]; then
        tail -n 50 backend/logs/payment.log
    else
        echo '支付日志文件不存在: backend/logs/payment.log'\n    fi
}

# 查看 AI 服务日志
view_ai_logs() {\n    echo '=== AI 服务日志 ==='
    if [ -f backend/logs/ai.log ]; then
        tail -n 50 backend/logs/ai.log
    else
        echo 'AI 服务日志文件不存在: backend/logs/ai.log'
    fi
}
\n# 实时日志监控
view_realtime_logs() {
    echo '=== 实时日志监控 ==='\n    echo '按Ctrl+C 退出监控'
    echo ''
    \n    if [ -f backend/logs/app.log ]; then
        tail -f backend/logs/app.log
    else
        echo '日志文件不存在: backend/logs/app.log'
    fi
}
\n# 主循环
while true; do\n    show_menu
    \n    case $choice in
        1)
            view_backend_logs
            ;;
        2)\n            view_frontend_logs
            ;;
        3)
            view_mongodb_logs
            ;;
        4)
            view_redis_logs\n            ;;
        5)
            view_error_logs
            ;;\n        6)
            view_access_logs
            ;;
        7)\n            view_security_logs
            ;;
        8)
            view_payment_logs
            ;;
        9)
            view_ai_logs\n            ;;
        10)
            view_realtime_logs
            ;;
        0)
            echo '退出日志查看'\n            exit 0
            ;;\n        *)
            echo '无效选项，请重新选择'
            ;;\n    esac\n    
    echo ''
    read -p '按回车键继续...'
done
```

### 6.8 停止服务脚本\n\n#### 6.8.1 停止服务脚本 (stop.sh)\n```bash
#!/bin/bash\n
# 停止服务脚本
\necho '=== 停止人格特质投资策略评估系统 ==='

# 停止 Node.js 进程
stop_nodejs() {
    echo '停止 Node.js 服务...'
    
    # 查找并停止后端进程
    backend_pids=$(pgrep -f 'node.*backend')
    if [ -n '$backend_pids' ]; then
        echo '停止后端服务...'
        kill $backend_pids\n        sleep 2
        \n        # 强制停止如果还在运行
        backend_pids=$(pgrep -f 'node.*backend')
        if [ -n '$backend_pids' ]; then
            kill -9 $backend_pids
        fi
        echo '✓ 后端服务已停止'
    else\n        echo '后端服务未运行'
    fi
    
    # 查找并停止前端进程\n    frontend_pids=$(pgrep -f 'node.*frontend\\|react-scripts\\|serve')
    if [ -n '$frontend_pids' ]; then
        echo '停止前端服务...'\n        kill $frontend_pids
        sleep 2\n        
        # 强制停止如果还在运行
        frontend_pids=$(pgrep -f 'node.*frontend\\|react-scripts\\|serve')\n        if [ -n '$frontend_pids' ]; then
            kill -9 $frontend_pids
        fi
        echo '✓ 前端服务已停止'
    else
        echo '前端服务未运行'
    fi
}\n
# 停止数据库服务（可选）
stop_databases() {
    read -p '是否停止数据库服务？(y/N): ' stop_db
    
    if [ '$stop_db' = 'y' ] || [ '$stop_db' = 'Y' ]; then
        echo '停止数据库服务...'
        
        # 停止 MongoDB\n        if [[ '$OSTYPE' == 'darwin'* ]]; then
            brew services stop mongodb/brew/mongodb-community
        else\n            sudo systemctl stop mongod
        fi
        echo '✓ MongoDB 已停止'
        
        # 停止 Redis\n        if [[ '$OSTYPE' == 'darwin'* ]]; then\n            brew services stop redis
        else
            sudo systemctl stop redis
        fi
        echo '✓ Redis 已停止'
    fi
}
\n# 清理临时文件
cleanup_temp_files() {\n    echo '清理临时文件...'
    \n    # 清理上传文件
    if [ -d backend/uploads/temp ]; then\n        rm -rf backend/uploads/temp/*
        echo '✓ 临时上传文件已清理'
    fi
    
    # 清理日志文件（可选）
    read -p '是否清理日志文件？(y/N): ' clean_logs
    if [ '$clean_logs' = 'y' ] || [ '$clean_logs' = 'Y' ]; then
        if [ -d backend/logs ]; then
            rm -f backend/logs/*.log
            echo '✓ 日志文件已清理'
        fi
    fi\n}

# 显示系统状态
show_status() {
    echo ''\n    echo '=== 系统状态 ==='
    \n    # 检查 Node.js 进程
    if pgrep -f 'node' > /dev/null; then
        echo '⚠️  仍有 Node.js 进程在运行:'
        pgrep -f 'node' | while read pid; do\n            ps -p $pid -o pid,cmd --no-headers
        done
    else
        echo '✓ 所有 Node.js 进程已停止'
    fi
    
    # 检查端口占用
    if lsof -i :3000 > /dev/null 2>&1; then
        echo '⚠️  端口 3000 仍被占用'\n    else
        echo '✓ 端口 3000 已释放'
    fi
    
    if lsof -i :5000 > /dev/null 2>&1; then
        echo '⚠️  端口 5000 仍被占用'\n    else
        echo '✓ 端口 5000 已释放'
    fi
}\n
# 主停止流程
main() {
    stop_nodejs
    stop_databases
    cleanup_temp_files
    show_status
    
    echo ''
    echo '=== 系统已停止 ==='
    echo ''
    echo '重新启动系统：./start.sh'
    echo '查看日志：./logs.sh'
    echo ''
}\n
main
```

### 6.9 部署检查清单

#### 6.9.1 部署前检查清单
```markdown
# 部署前检查清单\n
## 环境准备
- [ ] 操作系统版本符合要求
- [ ] Node.js v18.0.0+ 已安装\n- [ ] MongoDB v5.0+ 已安装并运行
- [ ] Redis v6.0+ 已安装并运行
- [ ] Git 已安装
- [ ] 网络连接正常

## 第三方服务配置
- [ ] DeepSeek API 密钥已获取
- [ ] 支付宝开放平台账号已配置
- [ ] 微信支付商户号已配置
- [ ] SMTP 邮件服务已配置
- [ ] CDN 服务已配置（可选）
\n## 环境变量配置
- [ ] backend/.env 文件已创建并配置
- [ ] frontend/.env 文件已创建并配置
- [ ] 管理员邮箱已设置
- [ ] JWT 密钥已设置
- [ ] 数据库连接字符串已配置
- [ ] 邮件服务配置已填写
- [ ] DeepSeek API 配置已填写\n- [ ] 支付服务配置已填写

## 安全配置
- [ ] 生产环境密钥已更换
- [ ] HTTPS 证书已配置
- [ ] 防火墙规则已设置
- [ ] 数据库访问权限已限制
- [ ] 文件上传目录权限已设置

## 功能测试
- [ ] 数据库连接测试通过
- [ ] 邮件发送测试通过
- [ ] DeepSeek API 调用测试通过\n- [ ] 支付接口测试通过
- [ ]礼品码功能测试通过
- [ ] 游戏功能测试通过
- [ ] 管理后台功能测试通过
\n## 性能优化
- [ ] 数据库索引已创建
- [ ] 静态资源已压缩
- [ ] CDN 已配置（生产环境）\n- [ ] 缓存策略已设置
- [ ] 日志轮转已配置
\n## 监控告警
- [ ] 系统监控已配置
- [ ] 错误告警已设置\n- [ ] 性能监控已启用
- [ ] 日志收集已配置\n
## 备份策略
- [ ] 数据库备份策略已设置\n- [ ] 代码备份已配置
- [ ] 配置文件备份已保存
- [ ] 恢复流程已测试
```

#### 6.9.2 生产环境部署指南
```markdown
# 生产环境部署指南
\n## 1. 服务器配置
\n### 推荐配置\n- CPU: 4核心以上\n- 内存: 8GB 以上
- 存储: 100GB SSD\n- 网络: 100Mbps 以上
- 操作系统: Ubuntu 20.04 LTS
\n### 安全加固
```bash
# 更新系统\nsudo apt update && sudo apt upgrade -y

# 配置防火墙
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
\n# 禁用 root 登录
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# 配置自动安全更新
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 2. 域名和 SSL 配置

### 使用 Nginx 反向代理
```nginx
# /etc/nginx/sites-available/personality-investment
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;\n\n    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;\n    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    \n    # 前端静态文件
    location / {
        root /var/www/personality-investment/frontend/build;
        try_files $uri $uri/ /index.html;
\n        # 缓存配置\n        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\n            expires 1y;
            add_header Cache-Control \"public, immutable\";
        }
    }
    
    # API 代理
    location /api/ {\n        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 安全头\n    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;
    add_header Content-Security-Policy \"default-src 'self' http: https: data: blob: 'unsafe-inline'\" always;
}
```
\n### 获取 SSL 证书
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
\n# 设置自动续期
sudo crontab -e\n# 添加以下行\n0 12 * * * /usr/bin/certbot renew --quiet
```

## 3. 进程管理
\n### 使用 PM2 管理 Node.js 进程
```bash
# 安装 PM2\nnpm install -g pm2
\n# 创建 PM2 配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'personality-investment-backend',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {\n      NODE_ENV: 'production',
      PORT: 5000\n    },
    error_file: './logs/pm2-error.log',\n    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true\n  }]
};
EOF

# 启动应用
pm2 start ecosystem.config.js
\n# 保存 PM2 配置
pm2 save
\n# 设置开机自启
pm2 startup\nsudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```
\n## 4. 数据库优化

### MongoDB 生产配置
```yaml
# /etc/mongod.conf
storage:\n  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2
\nsystemLog:
  destination: file
  logAppend: true
path: /var/log/mongodb/mongod.log
logRotate: reopen

net:
  port: 27017
  bindIp: 127.0.0.1

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
\nsecurity:
  authorization: enabled
\noperationProfiling:
  slowOpThresholdMs: 100
  mode: slowOp
```\n
### 创建数据库用户
```javascript
// 连接 MongoDB
mongo\n
// 创建管理员用户\nuse admin
db.createUser({\n  user: \"admin\",
  pwd: \"your_secure_password\",\n  roles: [ { role: \"userAdminAnyDatabase\", db: \"admin\" } ]
})

// 创建应用用户
use personality_investment
db.createUser({\n  user: \"app_user\",\n  pwd: \"your_app_password\",\n  roles: [ { role: \"readWrite\", db: \"personality_investment\" } ]
})
```

## 5. 监控和日志

### 系统监控
```bash
# 安装监控工具
sudo apt install htop iotop nethogs -y

# 配置日志轮转
sudo cat > /etc/logrotate.d/personality-investment << EOF
/var/www/personality-investment/logs/*.log {\n    daily
    missingok
    rotate 30
    compress
    delaycompress\n    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}\nEOF\n```

### 健康检查脚本
```bash
#!/bin/bash
# /usr/local/bin/health-check.sh

# 检查应用健康状态
if ! curl -f http://localhost:5000/api/v1/health > /dev/null 2>&1; then
    echo \"$(date): Backend health check failed\" >> /var/log/health-check.log
    pm2 restart personality-investment-backend
fi

# 检查数据库连接
if ! mongo --eval \"db.adminCommand('ping')\" > /dev/null 2>&1; then
    echo \"$(date): MongoDB connection failed\" >> /var/log/health-check.log
    sudo systemctl restart mongod
fi\n
# 检查 Redis 连接
if ! redis-cli ping > /dev/null 2>&1; then
    echo \"$(date): Redis connection failed\" >> /var/log/health-check.log\n    sudo systemctl restart redis
fi
```

```bash
# 设置定时健康检查
sudo crontab -e
# 添加以下行
*/5 * * * * /usr/local/bin/health-check.sh
```

## 6. 备份策略

### 数据库备份脚本
```bash
#!/bin/bash
# /usr/local/bin/backup-db.sh
\nBACKUP_DIR=\"/var/backups/personality-investment\"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份 MongoDB\nmongodump --db personality_investment --out $BACKUP_DIR/mongodb_$DATE

# 压缩备份\ntar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz -C $BACKUP_DIR mongodb_$DATE
rm -rf $BACKUP_DIR/mongodb_$DATE

# 删除 7 天前的备份
find $BACKUP_DIR -name \"mongodb_*.tar.gz\" -mtime +7 -delete\n
echo \"$(date): Database backup completed\" >> /var/log/backup.log
```

```bash
# 设置定时备份
sudo crontab -e
# 添加以下行
0 2 * * * /usr/local/bin/backup-db.sh
```

## 7. 部署脚本
\n### 自动部署脚本
```bash
#!/bin/bash
# deploy.sh
\nset -e

APP_DIR=\"/var/www/personality-investment\"
REPO_URL=\"https://github.com/your-repo/personality-investment-system.git\"
BRANCH=\"main\"

echo \"开始部署...\"

# 拉取最新代码
cd $APP_DIR\ngit fetch origin\ngit reset --hard origin/$BRANCH

# 安装依赖
echo \"安装后端依赖...\"
cd backend\nnpm ci --production

echo \"安装前端依赖...\"
cd ../frontend
npm ci

# 构建前端
echo \"构建前端...\"
npm run build
\n# 重启服务
echo \"重启服务...\"
pm2 restart personality-investment-backend

# 重载 Nginx
sudo nginx -t && sudo nginx -s reload

echo \"部署完成！\"
```

## 8. 性能优化

### 数据库索引优化
```javascript
// 在 MongoDB 中执行
use personality_investment\n
// 创建复合索引
db.tests.createIndex({ \"userId\": 1, \"createdAt\": -1 })
db.payments.createIndex({ \"userId\": 1, \"status\": 1, \"createdAt\": -1 })
db.giftcodes.createIndex({ \"code\": 1, \"status\": 1 })
db.aianalyses.createIndex({ \"userId\": 1, \"createdAt\": -1 })

// 查看索引使用情况
db.tests.getIndexes()
db.tests.explain(\"executionStats\").find({ \"userId\": \"test@example.com\" })
```

### Redis 缓存配置
```bash
# /etc/redis/redis.conf
maxmemory 1gb
maxmemory-policy allkeys-lru\nsave 900 1
save 300 10
save 60 10000
```

## 9. 安全加固

### 应用安全配置
```javascript
// backend/middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');\n
// 安全头\napp.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [\"'self'\"],
      styleSrc: [\"'self'\", \"'unsafe-inline'\"],
      scriptSrc: [\"'self'\"],
      imgSrc: [\"'self'\", \"data:\", \"https:\"],
      connectSrc: [\"'self'\"],
      fontSrc: [\"'self'\"],
      objectSrc: [\"'none'\"],
      mediaSrc: [\"'self'\"],\n      frameSrc: [\"'none'\"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 频率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 100, // limit each IP to 100 requests per windowMs\n  message: 'Too many requests from this IP'\n});
\napp.use('/api/', limiter);
```

## 10. 故障排除

### 常见问题解决

1. **应用无法启动**\n   - 检查环境变量配置
   - 检查数据库连接
   - 查看错误日志

2. **数据库连接失败**
   - 检查 MongoDB 服务状态
   - 验证连接字符串\n   - 检查网络连接

3. **支付功能异常**
   - 验证支付配置
   - 检查证书文件
   - 查看支付日志

4. **邮件发送失败**\n   - 检查 SMTP 配置
   - 验证邮箱密码
   - 测试网络连接

### 日志分析
```bash
# 查看错误日志
tail -f /var/www/personality-investment/logs/error.log

# 分析访问日志
awk '{print $1}' /var/www/personality-investment/logs/access.log | sort | uniq -c | sort -nr

# 监控系统资源
htop\niotop\nnethogs
```\n```

## 7. 使用说明

### 7.1 快速开始
\n1. **下载并运行安装脚本**：
   ```bash
   # Linux/macOS
   curl -fsSL https://raw.githubusercontent.com/your-repo/personality-investment-system/main/install.sh | bash\n   
   # 或手动下载
   wget https://raw.githubusercontent.com/your-repo/personality-investment-system/main/install.sh
   chmod +x install.sh\n   ./install.sh
   ```

2. **配置环境变量**：
   编辑 `backend/.env` 和 `frontend/.env` 文件，填入必要的配置信息

3. **启动系统**：
   ```bash
   ./start.sh dev  # 开发模式
   # 或
   ./start.sh      # 生产模式
   ```

4. **运行测试**：
   ```bash
   ./test.sh       # 完整测试
   # 或
   ./test.sh --api-only  # 仅测试 API
   ```

### 7.2 管理员操作

1. **注册管理员账号**：使用配置的 `ADMIN_EMAIL` 邮箱注册，系统自动分配管理员权限\n
2. **访问管理后台**：http://localhost:3000/admin

3. **生成礼品码**：在管理后台的礼品码管理页面批量生成

4. **监控系统状态**：查看实时统计数据和系统监控信息

### 7.3 故障排除

1. **查看日志**：
   ```bash\n   ./logs.sh  # 交互式日志查看
   ```

2. **重启服务**：
   ```bash
   ./stop.sh   # 停止服务
   ./start.sh  # 重新启动
   ```

3. **重置数据库**：
   ```bash
   cd backend
   npm run db:reset  # 重置并重新初始化数据库
   ```\n
### 7.4 系统维护

1. **定期备份**：
   ```bash
   # 备份数据库\n   mongodump --db personality_investment --out ./backup/$(date +%Y%m%d)\n   
   # 备份配置文件
   cp backend/.env ./backup/env_$(date +%Y%m%d).backup
   ```\n
2. **更新系统**：
   ```bash
   git pull origin main  # 拉取最新代码
   ./install.sh          # 重新安装依赖
   ./start.sh            # 重启服务
   ```

3. **监控性能**：
   ```bash
   ./test.sh --performance-only  # 性能测试
   ```
\n通过以上一键部署与测试指南，用户可以轻松完成系统的安装、配置、启动和测试，实现真正的傻瓜式部署和运维。
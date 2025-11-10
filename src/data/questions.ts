import type { Question } from '@/types/types';

// 增强版人格测试问题 - 结合BFI、16Personalities和交易特征
export const personalityQuestions: Question[] = [
  // ========== 开放性 (Openness) - 10题 ==========
  // 创新与探索
  { id: 'p1', text: '我经常主动寻找和尝试新的投资策略或产品', type: 'likert', trait: 'openness' },
  { id: 'p2', text: '我对加密货币、NFT等新兴投资领域充满好奇', type: 'likert', trait: 'openness' },
  { id: 'p3', text: '我更倾向于投资我熟悉和了解的传统资产', type: 'likert', trait: 'openness' }, // 反向
  { id: 'p4', text: '我喜欢研究不同国家和地区的投资机会', type: 'likert', trait: 'openness' },
  
  // 创意思维
  { id: 'p5', text: '我经常能想到独特的投资角度和机会', type: 'likert', trait: 'openness' },
  { id: 'p6', text: '我喜欢将不同领域的知识应用到投资分析中', type: 'likert', trait: 'openness' },
  { id: 'p7', text: '我更喜欢遵循经典的投资理论和方法', type: 'likert', trait: 'openness' }, // 反向
  
  // 学习意愿
  { id: 'p8', text: '我愿意花时间学习复杂的金融衍生品', type: 'likert', trait: 'openness' },
  { id: 'p9', text: '我对量化交易、算法交易等技术感兴趣', type: 'likert', trait: 'openness' },
  { id: 'p10', text: '我认为投资不需要太多创新，稳健就好', type: 'likert', trait: 'openness' }, // 反向
  
  // ========== 尽责性 (Conscientiousness) - 10题 ==========
  // 计划性
  { id: 'p11', text: '我会制定详细的投资计划，包括目标、策略和时间表', type: 'likert', trait: 'conscientiousness' },
  { id: 'p12', text: '我严格遵守自己设定的止损和止盈规则', type: 'likert', trait: 'conscientiousness' },
  { id: 'p13', text: '我经常因为市场变化而临时改变投资计划', type: 'likert', trait: 'conscientiousness' }, // 反向
  { id: 'p14', text: '我会定期（如每周/每月）检查和调整投资组合', type: 'likert', trait: 'conscientiousness' },
  
  // 自律性
  { id: 'p15', text: '我能够严格控制自己的交易频率，避免过度交易', type: 'likert', trait: 'conscientiousness' },
  { id: 'p16', text: '我会详细记录每一笔交易及其原因', type: 'likert', trait: 'conscientiousness' },
  { id: 'p17', text: '我有时会冲动地追涨杀跌', type: 'likert', trait: 'conscientiousness' }, // 反向
  
  // 风险管理
  { id: 'p18', text: '我在投资前会仔细评估和控制风险', type: 'likert', trait: 'conscientiousness' },
  { id: 'p19', text: '我倾向于避免高风险的投资机会', type: 'likert', trait: 'conscientiousness' },
  { id: 'p20', text: '我经常事后才意识到自己承担了过高的风险', type: 'likert', trait: 'conscientiousness' }, // 反向
  
  // ========== 外向性 (Extraversion) - 10题 ==========
  // 社交倾向
  { id: 'p21', text: '我喜欢在投资社群或论坛中分享观点', type: 'likert', trait: 'extraversion' },
  { id: 'p22', text: '我更喜欢独自研究，不太愿意与他人讨论', type: 'likert', trait: 'extraversion' }, // 反向
  { id: 'p23', text: '我经常参加投资讲座、沙龙等线下活动', type: 'likert', trait: 'extraversion' },
  { id: 'p24', text: '我在投资群体中通常比较活跃和健谈', type: 'likert', trait: 'extraversion' },
  
  // 决策风格
  { id: 'p25', text: '我喜欢快速做出投资决策并立即执行', type: 'likert', trait: 'extraversion' },
  { id: 'p26', text: '我需要长时间独自思考才能做出决策', type: 'likert', trait: 'extraversion' }, // 反向
  { id: 'p27', text: '我在做重要投资决策时会寻求他人的反馈', type: 'likert', trait: 'extraversion' },
  
  // 自信表达
  { id: 'p28', text: '我对自己的投资判断充满信心', type: 'likert', trait: 'extraversion' },
  { id: 'p29', text: '我愿意公开分享自己的投资业绩', type: 'likert', trait: 'extraversion' },
  { id: 'p30', text: '我不太愿意在公开场合表达投资观点', type: 'likert', trait: 'extraversion' }, // 反向
  
  // ========== 宜人性 (Agreeableness) - 10题 ==========
  // 信任与合作
  { id: 'p31', text: '我愿意相信并采纳专业理财顾问的建议', type: 'likert', trait: 'agreeableness' },
  { id: 'p32', text: '我对市场上的"专家"观点持怀疑态度', type: 'likert', trait: 'agreeableness' }, // 反向
  { id: 'p33', text: '我倾向于跟随市场主流共识', type: 'likert', trait: 'agreeableness' },
  { id: 'p34', text: '我喜欢与他人合作进行投资决策', type: 'likert', trait: 'agreeableness' },
  
  // 竞争vs合作
  { id: 'p35', text: '我认为投资是零和游戏，必须战胜他人', type: 'likert', trait: 'agreeableness' }, // 反向
  { id: 'p36', text: '我愿意分享有价值的投资信息给朋友', type: 'likert', trait: 'agreeableness' },
  { id: 'p37', text: '我更关注自己的收益，而非与他人比较', type: 'likert', trait: 'agreeableness' },
  
  // 决策独立性
  { id: 'p38', text: '我更相信自己的分析而非权威意见', type: 'likert', trait: 'agreeableness' }, // 反向
  { id: 'p39', text: '我容易被他人的投资成功故事影响', type: 'likert', trait: 'agreeableness' },
  { id: 'p40', text: '我倾向于逆向思考，不随大流', type: 'likert', trait: 'agreeableness' }, // 反向
  
  // ========== 神经质 (Neuroticism) - 10题 ==========
  // 情绪稳定性
  { id: 'p41', text: '市场的剧烈波动会让我感到焦虑不安', type: 'likert', trait: 'neuroticism' },
  { id: 'p42', text: '即使账面亏损，我也能保持冷静和理性', type: 'likert', trait: 'neuroticism' }, // 反向
  { id: 'p43', text: '我经常担心投资会失败或亏损', type: 'likert', trait: 'neuroticism' },
  { id: 'p44', text: '投资的盈亏会显著影响我的日常情绪', type: 'likert', trait: 'neuroticism' },
  
  // 压力应对
  { id: 'p45', text: '在市场下跌时，我很难集中精力做其他事情', type: 'likert', trait: 'neuroticism' },
  { id: 'p46', text: '我能够承受较大的投资压力而不影响生活', type: 'likert', trait: 'neuroticism' }, // 反向
  { id: 'p47', text: '我经常因为市场走势而失眠', type: 'likert', trait: 'neuroticism' },
  
  // 决策焦虑
  { id: 'p48', text: '做出投资决策后，我经常会反复怀疑自己', type: 'likert', trait: 'neuroticism' },
  { id: 'p49', text: '我对投资决策充满信心，很少事后后悔', type: 'likert', trait: 'neuroticism' }, // 反向
  { id: 'p50', text: '我害怕错过投资机会（FOMO心理）', type: 'likert', trait: 'neuroticism' }
];

// ========== 交易特征问题 ==========
export const tradingCharacteristicsQuestions: Question[] = [
  {
    id: 't1',
    text: '您的交易频率通常是：',
    type: 'multiple_choice',
    options: [
      '日内交易（每天多次）',
      '短线交易（持仓几天到几周）',
      '中线交易（持仓几个月）',
      '长线投资（持仓一年以上）'
    ]
  },
  {
    id: 't2',
    text: '您最感兴趣的投资标的是：（可多选，但请选择最主要的）',
    type: 'multiple_choice',
    options: [
      'A股/港股',
      '美股/国际股市',
      '加密货币',
      '期货/期权等衍生品',
      '基金（指数基金、主动基金）',
      '债券/固定收益产品'
    ]
  },
  {
    id: 't3',
    text: '您更倾向于哪种交易分析方法？',
    type: 'multiple_choice',
    options: [
      '技术分析为主（K线、指标、形态）',
      '基本面分析为主（财报、行业、宏观）',
      '量化分析为主（数据模型、统计套利）',
      '两者结合使用'
    ]
  },
  {
    id: 't4',
    text: '在技术分析工具中，您更偏好：',
    type: 'multiple_choice',
    options: [
      '主观性工具（波浪理论、缠论、江恩理论等）',
      '客观性指标（MACD、RSI、布林带等）',
      '数据驱动（量价关系、统计模型）',
      '不使用技术分析'
    ]
  },
  {
    id: 't5',
    text: '您的交易决策主要基于：',
    type: 'multiple_choice',
    options: [
      '直觉和经验',
      '系统化的交易规则',
      '量化模型和回测数据',
      '跟随市场热点和消息'
    ]
  },
  {
    id: 't6',
    text: '您对以下哪种投资理念最认同？',
    type: 'multiple_choice',
    options: [
      '趋势为王，顺势而为',
      '价值投资，长期持有',
      '波段操作，高抛低吸',
      '套利交易，稳定收益'
    ]
  },
  {
    id: 't7',
    text: '您通常如何学习和提升投资能力？',
    type: 'multiple_choice',
    options: [
      '阅读投资大师的书籍和理论',
      '研究历史数据和回测策略',
      '参加培训课程和投资社群',
      '通过实战总结经验教训'
    ]
  },
  {
    id: 't8',
    text: '您对投资组合的态度是：',
    type: 'multiple_choice',
    options: [
      '集中投资，重仓少数标的',
      '适度分散，5-10个标的',
      '充分分散，10个以上标的',
      '全部投资指数基金'
    ]
  }
];

// 数学与金融能力测试问题
export const mathFinanceQuestions: Question[] = [
  {
    id: 'm1',
    text: '如果一项投资的年化收益率为8%，采用复利计算，10年后10万元会变成多少？',
    type: 'multiple_choice',
    options: ['18万元', '21.6万元', '21.59万元', '20万元']
  },
  {
    id: 'm2',
    text: '以下哪个指标最能反映投资组合的风险调整后收益？',
    type: 'multiple_choice',
    options: ['总收益率', '夏普比率', '最大回撤', '波动率']
  },
  {
    id: 'm3',
    text: '假设某股票的贝塔系数为1.5，市场上涨10%时，该股票理论上会：',
    type: 'multiple_choice',
    options: ['上涨10%', '上涨15%', '上涨5%', '下跌15%']
  },
  {
    id: 'm4',
    text: '投资组合的标准差主要衡量的是：',
    type: 'multiple_choice',
    options: ['预期收益', '风险水平', '流动性', '税收效率']
  },
  {
    id: 'm5',
    text: '在其他条件相同的情况下，久期越长的债券：',
    type: 'multiple_choice',
    options: ['利率风险越小', '利率风险越大', '信用风险越小', '流动性越好']
  },
  {
    id: 'm6',
    text: '某投资者以50元买入股票，设置止损价为45元，止损幅度是：',
    type: 'multiple_choice',
    options: ['5%', '10%', '11.1%', '9%']
  },
  {
    id: 'm7',
    text: '市盈率(P/E)的计算公式是：',
    type: 'multiple_choice',
    options: ['股价/每股收益', '每股收益/股价', '股价/每股净资产', '市值/净利润']
  },
  {
    id: 'm8',
    text: '以下哪种投资策略属于被动投资？',
    type: 'multiple_choice',
    options: ['价值投资', '指数基金投资', '波段交易', '套利交易']
  },
  {
    id: 'm9',
    text: '假设通货膨胀率为3%，名义收益率为8%，实际收益率约为：',
    type: 'multiple_choice',
    options: ['5%', '11%', '4.85%', '8%']
  },
  {
    id: 'm10',
    text: '分散投资的主要目的是：',
    type: 'multiple_choice',
    options: ['提高收益', '降低非系统性风险', '增加流动性', '减少交易成本']
  }
];

// 数学金融测试答案（正确答案的索引）
export const mathFinanceAnswers: Record<string, number> = {
  'm1': 2, // 21.59万元
  'm2': 1, // 夏普比率
  'm3': 1, // 上涨15%
  'm4': 1, // 风险水平
  'm5': 1, // 利率风险越大
  'm6': 1, // 10%
  'm7': 0, // 股价/每股收益
  'm8': 1, // 指数基金投资
  'm9': 2, // 4.85%
  'm10': 1 // 降低非系统性风险
};

// 风险偏好测试问题
export const riskPreferenceQuestions: Question[] = [
  {
    id: 'r1',
    text: '您有10万元可投资资金，以下哪种投资方案最符合您的偏好？',
    type: 'scenario',
    options: [
      'A: 银行存款，年收益2%，几乎无风险',
      'B: 债券基金，预期年收益5%，可能亏损5%',
      'C: 混合基金，预期年收益10%，可能亏损15%',
      'D: 股票基金，预期年收益20%，可能亏损30%'
    ]
  },
  {
    id: 'r2',
    text: '如果您的投资在一个月内亏损了10%，您会：',
    type: 'scenario',
    options: [
      '立即卖出，避免更大损失',
      '观望一段时间，看是否反弹',
      '保持持有，相信长期会盈利',
      '加仓买入，降低平均成本'
    ]
  },
  {
    id: 'r3',
    text: '您的投资期限是：',
    type: 'scenario',
    options: [
      '短期（1年以内）',
      '中期（2-5年）',
      '长期（5年以上）',
      '没有明确期限'
    ]
  },
  {
    id: 'r4',
    text: '您能接受的最大投资亏损比例是：',
    type: 'scenario',
    options: [
      '5%以内',
      '10%以内',
      '20%以内',
      '30%以上'
    ]
  },
  {
    id: 'r5',
    text: '面对市场大幅下跌，您的反应是：',
    type: 'scenario',
    options: [
      '非常恐慌，立即清仓',
      '比较担心，减少部分仓位',
      '保持冷静，继续持有',
      '认为是机会，增加投资'
    ]
  }
];

// Likert 量表选项
export const likertOptions = [
  { value: 1, label: '非常不同意' },
  { value: 2, label: '不同意' },
  { value: 3, label: '中立' },
  { value: 4, label: '同意' },
  { value: 5, label: '非常同意' }
];

// 需要反向计分的题目ID
export const reverseScoreQuestions = [
  'p3', 'p7', 'p10', // 开放性反向题
  'p13', 'p17', 'p20', // 尽责性反向题
  'p22', 'p26', 'p30', // 外向性反向题
  'p32', 'p35', 'p38', 'p40', // 宜人性反向题
  'p42', 'p46', 'p49' // 神经质反向题
];

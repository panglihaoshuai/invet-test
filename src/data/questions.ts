import type { Question } from '@/types/types';

// Big Five 人格测试问题
export const personalityQuestions: Question[] = [
  // 开放性 (Openness)
  { id: 'p1', text: '我喜欢尝试新的投资产品和策略', type: 'likert', trait: 'openness' },
  { id: 'p2', text: '我对复杂的金融衍生品感兴趣', type: 'likert', trait: 'openness' },
  { id: 'p3', text: '我更喜欢传统的投资方式', type: 'likert', trait: 'openness' }, // 反向计分
  { id: 'p4', text: '我愿意学习新的投资理念和方法', type: 'likert', trait: 'openness' },
  
  // 尽责性 (Conscientiousness)
  { id: 'p5', text: '我会制定详细的投资计划并严格执行', type: 'likert', trait: 'conscientiousness' },
  { id: 'p6', text: '我经常记录和分析自己的投资决策', type: 'likert', trait: 'conscientiousness' },
  { id: 'p7', text: '我有时会冲动地做出投资决定', type: 'likert', trait: 'conscientiousness' }, // 反向计分
  { id: 'p8', text: '我会定期检查和调整投资组合', type: 'likert', trait: 'conscientiousness' },
  
  // 外向性 (Extraversion)
  { id: 'p9', text: '我喜欢与他人讨论投资想法', type: 'likert', trait: 'extraversion' },
  { id: 'p10', text: '我倾向于独自研究和做决策', type: 'likert', trait: 'extraversion' }, // 反向计分
  { id: 'p11', text: '我喜欢参加投资相关的社交活动', type: 'likert', trait: 'extraversion' },
  { id: 'p12', text: '我在投资时更依赖自己的判断而非他人意见', type: 'likert', trait: 'extraversion' }, // 反向计分
  
  // 宜人性 (Agreeableness)
  { id: 'p13', text: '我愿意听取专业理财顾问的建议', type: 'likert', trait: 'agreeableness' },
  { id: 'p14', text: '我倾向于跟随市场主流观点', type: 'likert', trait: 'agreeableness' },
  { id: 'p15', text: '我更相信自己的分析而非专家意见', type: 'likert', trait: 'agreeableness' }, // 反向计分
  { id: 'p16', text: '我喜欢参与集体投资决策', type: 'likert', trait: 'agreeableness' },
  
  // 神经质 (Neuroticism)
  { id: 'p17', text: '市场波动会让我感到焦虑', type: 'likert', trait: 'neuroticism' },
  { id: 'p18', text: '我经常担心投资会亏损', type: 'likert', trait: 'neuroticism' },
  { id: 'p19', text: '即使市场下跌，我也能保持冷静', type: 'likert', trait: 'neuroticism' }, // 反向计分
  { id: 'p20', text: '投资亏损会严重影响我的情绪', type: 'likert', trait: 'neuroticism' }
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
export const reverseScoreQuestions = ['p3', 'p7', 'p10', 'p12', 'p15', 'p19'];

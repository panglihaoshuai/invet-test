import type { PersonalityScores, InvestmentStyleVector, TradingCharacteristics } from '@/types/types';

// 投资风格向量定义
export const investmentStyles: InvestmentStyleVector[] = [
  {
    name: '趋势跟踪',
    description: '适合高开放性、低神经质、中等尽责性的投资者',
    personality_vector: {
      openness: 8,
      conscientiousness: 6,
      extraversion: 7,
      agreeableness: 5,
      neuroticism: 3
    },
    min_math_score: 60,
    risk_level: 7
  },
  {
    name: '波段交易',
    description: '适合高外向性、中等开放性、低神经质的投资者',
    personality_vector: {
      openness: 6,
      conscientiousness: 7,
      extraversion: 8,
      agreeableness: 5,
      neuroticism: 4
    },
    min_math_score: 70,
    risk_level: 8
  },
  {
    name: '价值投资',
    description: '适合高尽责性、高宜人性、低神经质的投资者',
    personality_vector: {
      openness: 5,
      conscientiousness: 9,
      extraversion: 5,
      agreeableness: 8,
      neuroticism: 3
    },
    min_math_score: 50,
    risk_level: 4
  },
  {
    name: '指数基金投资',
    description: '适合中等开放性、高尽责性、低风险偏好的投资者',
    personality_vector: {
      openness: 5,
      conscientiousness: 8,
      extraversion: 5,
      agreeableness: 7,
      neuroticism: 4
    },
    min_math_score: 40,
    risk_level: 3
  },
  {
    name: '量化交易',
    description: '适合高开放性、高尽责性、低神经质、高数学能力的投资者',
    personality_vector: {
      openness: 9,
      conscientiousness: 8,
      extraversion: 5,
      agreeableness: 5,
      neuroticism: 3
    },
    min_math_score: 80,
    risk_level: 7
  },
  {
    name: '固定收益投资',
    description: '适合低开放性、高尽责性、高宜人性、低风险偏好的投资者',
    personality_vector: {
      openness: 4,
      conscientiousness: 8,
      extraversion: 4,
      agreeableness: 8,
      neuroticism: 5
    },
    min_math_score: 30,
    risk_level: 2
  }
];

// 计算欧几里得距离
export function calculateEuclideanDistance(
  vector1: PersonalityScores,
  vector2: PersonalityScores
): number {
  const diff = {
    openness: vector1.openness - vector2.openness,
    conscientiousness: vector1.conscientiousness - vector2.conscientiousness,
    extraversion: vector1.extraversion - vector2.extraversion,
    agreeableness: vector1.agreeableness - vector2.agreeableness,
    neuroticism: vector1.neuroticism - vector2.neuroticism
  };

  const sumOfSquares =
    diff.openness ** 2 +
    diff.conscientiousness ** 2 +
    diff.extraversion ** 2 +
    diff.agreeableness ** 2 +
    diff.neuroticism ** 2;

  return Math.sqrt(sumOfSquares);
}

// 匹配最佳投资风格
export function matchInvestmentStyle(
  personalityScores: PersonalityScores,
  mathScore: number,
  riskLevel: number
): { style: InvestmentStyleVector; distance: number } {
  let bestMatch = investmentStyles[0];
  let minDistance = Number.POSITIVE_INFINITY;

  for (const style of investmentStyles) {
    // 检查数学能力是否满足要求
    if (mathScore < style.min_math_score) {
      continue;
    }

    // 检查风险偏好是否匹配（允许±2的差异）
    if (Math.abs(riskLevel - style.risk_level) > 2) {
      continue;
    }

    // 计算人格向量距离
    const distance = calculateEuclideanDistance(personalityScores, style.personality_vector);

    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = style;
    }
  }

  return { style: bestMatch, distance: minDistance };
}

// 生成人格分析文本
export function generatePersonalityAnalysis(scores: PersonalityScores): string {
  const traits = [];

  if (scores.openness >= 7) {
    traits.push('您具有较高的开放性，善于接受新想法和创新策略');
  } else if (scores.openness <= 4) {
    traits.push('您倾向于保守稳健的投资方式');
  }

  if (scores.conscientiousness >= 7) {
    traits.push('您做事认真负责，适合需要长期规划的投资策略');
  }

  if (scores.extraversion >= 7) {
    traits.push('您性格外向，适合需要频繁决策的交易方式');
  }

  if (scores.agreeableness >= 7) {
    traits.push('您善于合作，适合团队投资或跟随专业建议');
  }

  if (scores.neuroticism <= 4) {
    traits.push('您情绪稳定，能够承受市场波动带来的压力');
  } else if (scores.neuroticism >= 7) {
    traits.push('建议选择波动较小的投资产品以降低心理压力');
  }

  return traits.join('；') + '。';
}

// 生成数学金融能力分析
export function generateMathFinanceAnalysis(percentage: number): string {
  if (percentage >= 80) {
    return '您的数学和金融知识非常扎实，能够理解复杂的投资产品和策略，适合尝试量化交易或衍生品投资。';
  } else if (percentage >= 60) {
    return '您具备良好的数学和金融基础，能够理解大多数投资产品，适合主动管理型投资策略。';
  } else if (percentage >= 40) {
    return '您的数学和金融知识处于中等水平，建议选择相对简单的投资产品，或在专业人士指导下进行投资。';
  } else {
    return '建议您先加强金融知识学习，可以从指数基金等简单产品开始，逐步积累投资经验。';
  }
}

// 生成风险偏好分析
export function generateRiskAnalysis(riskLevel: number, investmentHorizon: string): string {
  let analysis = '';

  if (riskLevel >= 8) {
    analysis = '您具有较高的风险承受能力，可以考虑高风险高收益的投资产品';
  } else if (riskLevel >= 5) {
    analysis = '您的风险承受能力适中，适合平衡型投资组合';
  } else {
    analysis = '您偏好稳健投资，建议选择低风险产品';
  }

  analysis += `。您的投资期限为${investmentHorizon}，`;

  if (investmentHorizon === '长期（5年以上）') {
    analysis += '长期投资可以更好地平滑市场波动，适合权益类资产配置';
  } else if (investmentHorizon === '中期（2-5年）') {
    analysis += '中期投资需要平衡收益和流动性，建议采用多元化配置';
  } else {
    analysis += '短期投资应注重资金安全和流动性，建议选择低风险产品';
  }

  return analysis + '。';
}

// 生成详细投资建议
export function generateDetailedRecommendations(
  styleName: string,
  personalityScores: PersonalityScores,
  mathPercentage: number,
  riskLevel: number
): string[] {
  const recommendations: string[] = [];

  // 基于投资风格的建议
  switch (styleName) {
    case '趋势跟踪':
      recommendations.push('关注市场趋势，使用技术分析工具识别买卖信号');
      recommendations.push('设置止损点，控制单次交易风险在总资金的2-3%以内');
      recommendations.push('保持耐心，避免频繁交易，让趋势充分发展');
      break;
    case '波段交易':
      recommendations.push('学习技术分析，掌握支撑位和阻力位的判断方法');
      recommendations.push('控制持仓时间，通常在几天到几周之间');
      recommendations.push('严格执行交易计划，避免情绪化决策');
      break;
    case '价值投资':
      recommendations.push('深入研究公司基本面，关注财务报表和行业地位');
      recommendations.push('寻找被低估的优质公司，长期持有');
      recommendations.push('建立安全边际，在价格明显低于内在价值时买入');
      break;
    case '指数基金投资':
      recommendations.push('选择费率低、跟踪误差小的指数基金');
      recommendations.push('采用定投策略，平滑市场波动');
      recommendations.push('长期持有，享受市场整体增长红利');
      break;
    case '量化交易':
      recommendations.push('学习编程和数据分析，开发自己的交易策略');
      recommendations.push('进行充分的回测，验证策略的有效性');
      recommendations.push('持续优化模型，适应市场变化');
      break;
    case '固定收益投资':
      recommendations.push('关注债券评级，选择信用等级较高的产品');
      recommendations.push('分散投资，降低单一债券违约风险');
      recommendations.push('注意利率变化对债券价格的影响');
      break;
  }

  // 基于数学能力的建议
  if (mathPercentage < 60) {
    recommendations.push('建议参加金融知识培训课程，提升投资理论基础');
  }

  // 基于风险偏好的建议
  if (riskLevel >= 7) {
    recommendations.push('虽然您风险承受能力较高，但仍需做好资产配置，避免过度集中');
  } else if (riskLevel <= 3) {
    recommendations.push('可以将大部分资金配置在低风险产品，小部分尝试中等风险投资');
  }

  // 基于人格特质的建议
  if (personalityScores.neuroticism >= 7) {
    recommendations.push('建议设置自动化交易规则，减少情绪对投资决策的影响');
  }

  if (personalityScores.conscientiousness >= 8) {
    recommendations.push('您的自律性强，适合制定详细的投资计划并严格执行');
  }

  return recommendations;
}

// 生成交易特征分析
export function generateTradingCharacteristicsAnalysis(characteristics: TradingCharacteristics): string {
  const analysis: string[] = [];

  // 交易频率分析
  if (characteristics.trading_frequency.includes('日内')) {
    analysis.push('您偏好日内交易，需要较强的盘感和快速决策能力');
  } else if (characteristics.trading_frequency.includes('短线')) {
    analysis.push('您适合短线交易，需要关注技术面和市场情绪');
  } else if (characteristics.trading_frequency.includes('中线')) {
    analysis.push('您倾向中线交易，适合结合技术面和基本面分析');
  } else {
    analysis.push('您是长线投资者，更注重基本面和长期价值');
  }

  // 分析方法
  if (characteristics.analysis_method.includes('技术分析')) {
    analysis.push('您主要使用技术分析，建议系统学习各类技术指标和形态');
  } else if (characteristics.analysis_method.includes('基本面')) {
    analysis.push('您注重基本面分析，建议深入研究财务报表和行业动态');
  } else if (characteristics.analysis_method.includes('量化')) {
    analysis.push('您偏好量化分析，建议加强编程和数据分析能力');
  }

  // 技术偏好
  if (characteristics.technical_preference.includes('主观性')) {
    analysis.push('您倾向使用波浪理论、缠论等主观性工具，需要大量实践积累经验');
  } else if (characteristics.technical_preference.includes('客观性')) {
    analysis.push('您使用客观性指标，建议结合多个指标综合判断');
  } else if (characteristics.technical_preference.includes('数据驱动')) {
    analysis.push('您是数据驱动型交易者，适合开发量化策略');
  }

  // 投资理念
  if (characteristics.investment_philosophy.includes('趋势')) {
    analysis.push('您认同趋势交易理念，建议学习趋势识别和跟踪技巧');
  } else if (characteristics.investment_philosophy.includes('价值')) {
    analysis.push('您是价值投资者，建议深入学习价值评估方法');
  } else if (characteristics.investment_philosophy.includes('波段')) {
    analysis.push('您擅长波段操作，需要精准把握买卖时机');
  }

  return analysis.join('；') + '。';
}

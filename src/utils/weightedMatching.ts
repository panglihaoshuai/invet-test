import type { PersonalityScores } from '@/types/types';

// 特征权重定义（敏感特征权重更高）
export const TRAIT_WEIGHTS = {
  neuroticism: 2.5,        // 神经质（情绪稳定性）- 最重要
  conscientiousness: 2.0,  // 尽责性（耐心、自律）- 很重要
  openness: 1.5,           // 开放性（接受新事物）- 重要
  extraversion: 1.2,       // 外向性（反应速度）- 较重要
  agreeableness: 1.0       // 宜人性 - 基础权重
};

// 投资原型定义（包含理想区间）
export interface InvestmentArchetype {
  name: string;
  description: string;
  // 理想特征区间 [最小值, 最大值]
  ideal_ranges: {
    openness: [number, number];
    conscientiousness: [number, number];
    extraversion: [number, number];
    agreeableness: [number, number];
    neuroticism: [number, number];
  };
  // 数学能力要求区间
  math_range: [number, number];
  // 风险偏好区间
  risk_range: [number, number];
  // 硬性约束（违反则强力扣分）
  hard_constraints: {
    trait: keyof PersonalityScores;
    condition: 'max' | 'min';
    threshold: number;
    penalty: number; // 惩罚系数
    reason: string;
  }[];
  // 推荐交易频率
  trading_frequency: string;
  // 推荐交易风格
  trading_style: string;
  // 持仓周期
  holding_period: string;
}

// 定义所有投资原型
export const INVESTMENT_ARCHETYPES: InvestmentArchetype[] = [
  {
    name: '趋势跟踪者',
    description: '善于识别和跟随市场趋势，耐心持有，情绪稳定',
    ideal_ranges: {
      openness: [7, 9],           // 需要开放接受新趋势
      conscientiousness: [6, 8],  // 需要一定纪律性
      extraversion: [5, 8],       // 中等到较高的行动力
      agreeableness: [4, 6],      // 不需要太高
      neuroticism: [2, 4]         // 必须情绪稳定
    },
    math_range: [60, 100],
    risk_range: [6, 9],
    hard_constraints: [
      {
        trait: 'neuroticism',
        condition: 'max',
        threshold: 6,
        penalty: 3.0,
        reason: '趋势跟踪需要极强的情绪控制力，神经质过高会导致频繁止损'
      },
      {
        trait: 'conscientiousness',
        condition: 'min',
        threshold: 5,
        penalty: 2.0,
        reason: '趋势跟踪需要严格执行交易纪律，尽责性过低容易冲动交易'
      }
    ],
    trading_frequency: '中低频（每月1-5次）',
    trading_style: '趋势跟随，顺势而为',
    holding_period: '中长期（数周至数月）'
  },
  {
    name: '波段交易者',
    description: '快速反应，频繁交易，善于捕捉短期波动',
    ideal_ranges: {
      openness: [6, 8],
      conscientiousness: [7, 9],  // 需要高度自律
      extraversion: [7, 9],       // 需要快速反应
      agreeableness: [4, 6],
      neuroticism: [2, 5]         // 需要较好的情绪控制
    },
    math_range: [70, 100],
    risk_range: [7, 10],
    hard_constraints: [
      {
        trait: 'extraversion',
        condition: 'min',
        threshold: 6,
        penalty: 2.5,
        reason: '波段交易需要快速决策和执行，外向性过低反应速度不足'
      },
      {
        trait: 'neuroticism',
        condition: 'max',
        threshold: 6,
        penalty: 3.0,
        reason: '频繁交易会放大情绪波动，神经质过高容易做出错误决策'
      },
      {
        trait: 'conscientiousness',
        condition: 'min',
        threshold: 6,
        penalty: 2.0,
        reason: '波段交易需要严格的止损纪律，尽责性不足容易亏损'
      }
    ],
    trading_frequency: '高频（每周2-10次）',
    trading_style: '波段操作，高抛低吸',
    holding_period: '短期（数天至数周）'
  },
  {
    name: '价值投资者',
    description: '注重基本面，长期持有，追求稳健收益',
    ideal_ranges: {
      openness: [4, 7],           // 不需要太高
      conscientiousness: [8, 10], // 需要极高的耐心和纪律
      extraversion: [3, 6],       // 不需要快速反应
      agreeableness: [7, 9],      // 需要理性和合作精神
      neuroticism: [2, 4]         // 必须情绪稳定
    },
    math_range: [50, 100],
    risk_range: [3, 6],
    hard_constraints: [
      {
        trait: 'conscientiousness',
        condition: 'min',
        threshold: 7,
        penalty: 3.0,
        reason: '价值投资需要极强的耐心和长期持有能力，尽责性不足难以坚持'
      },
      {
        trait: 'neuroticism',
        condition: 'max',
        threshold: 5,
        penalty: 2.5,
        reason: '价值投资需要忍受短期波动，神经质过高容易在底部割肉'
      },
      {
        trait: 'extraversion',
        condition: 'max',
        threshold: 7,
        penalty: 1.5,
        reason: '价值投资需要耐心等待，过于外向可能导致频繁换股'
      }
    ],
    trading_frequency: '极低频（每季度1-3次）',
    trading_style: '深度研究，长期持有',
    holding_period: '长期（数月至数年）'
  },
  {
    name: '指数基金投资者',
    description: '被动投资，定投为主，追求市场平均收益',
    ideal_ranges: {
      openness: [4, 7],
      conscientiousness: [7, 9],  // 需要坚持定投
      extraversion: [3, 6],
      agreeableness: [6, 9],
      neuroticism: [3, 6]         // 可以接受一定波动
    },
    math_range: [40, 100],
    risk_range: [2, 5],
    hard_constraints: [
      {
        trait: 'conscientiousness',
        condition: 'min',
        threshold: 6,
        penalty: 2.0,
        reason: '指数基金定投需要长期坚持，尽责性不足容易半途而废'
      },
      {
        trait: 'openness',
        condition: 'max',
        threshold: 8,
        penalty: 1.5,
        reason: '指数基金投资策略简单，过于开放可能导致频繁更换策略'
      }
    ],
    trading_frequency: '极低频（每月定投）',
    trading_style: '被动投资，定期定额',
    holding_period: '长期（数年）'
  },
  {
    name: '量化交易者',
    description: '数据驱动，系统化交易，依赖模型和算法',
    ideal_ranges: {
      openness: [8, 10],          // 需要极高的创新能力
      conscientiousness: [8, 10], // 需要严格执行系统
      extraversion: [4, 7],       // 中等即可
      agreeableness: [4, 7],
      neuroticism: [2, 4]         // 必须情绪稳定
    },
    math_range: [80, 100],        // 需要极强的数学能力
    risk_range: [6, 9],
    hard_constraints: [
      {
        trait: 'openness',
        condition: 'min',
        threshold: 7,
        penalty: 3.0,
        reason: '量化交易需要持续学习和创新，开放性不足难以开发有效策略'
      },
      {
        trait: 'conscientiousness',
        condition: 'min',
        threshold: 7,
        penalty: 2.5,
        reason: '量化交易需要严格执行系统信号，尽责性不足容易主观干预'
      },
      {
        trait: 'neuroticism',
        condition: 'max',
        threshold: 5,
        penalty: 2.0,
        reason: '量化交易需要信任系统，神经质过高容易在回撤时放弃策略'
      }
    ],
    trading_frequency: '高频（由系统决定）',
    trading_style: '算法驱动，系统化交易',
    holding_period: '灵活（由模型决定）'
  },
  {
    name: '固定收益投资者',
    description: '保守稳健，追求确定性收益，风险厌恶',
    ideal_ranges: {
      openness: [3, 5],           // 偏保守
      conscientiousness: [7, 9],
      extraversion: [3, 5],       // 不需要快速反应
      agreeableness: [7, 9],
      neuroticism: [4, 7]         // 可以接受较高神经质
    },
    math_range: [30, 100],
    risk_range: [1, 3],
    hard_constraints: [
      {
        trait: 'openness',
        condition: 'max',
        threshold: 6,
        penalty: 2.0,
        reason: '固定收益投资策略保守，过于开放可能导致冒险尝试高风险产品'
      },
      {
        trait: 'extraversion',
        condition: 'max',
        threshold: 6,
        penalty: 1.5,
        reason: '固定收益投资不需要频繁操作，过于外向可能导致不必要的交易'
      }
    ],
    trading_frequency: '极低频（买入持有）',
    trading_style: '保守稳健，追求确定性',
    holding_period: '长期（持有到期）'
  }
];

// 区间评分函数
export function scoreInRange(value: number, range: [number, number]): number {
  const [min, max] = range;
  
  // 在理想区间内，满分100
  if (value >= min && value <= max) {
    return 100;
  }
  
  // 在区间外，根据距离扣分
  if (value < min) {
    const distance = min - value;
    // 每偏离1分，扣10分，最低0分
    return Math.max(0, 100 - distance * 10);
  } else {
    const distance = value - max;
    // 每偏离1分，扣10分，最低0分
    return Math.max(0, 100 - distance * 10);
  }
}

// 检查硬性约束
export function checkHardConstraints(
  personalityScores: PersonalityScores,
  constraints: InvestmentArchetype['hard_constraints']
): { violated: boolean; penalties: number; reasons: string[] } {
  let totalPenalty = 0;
  const reasons: string[] = [];
  
  for (const constraint of constraints) {
    const value = personalityScores[constraint.trait];
    let violated = false;
    
    if (constraint.condition === 'max' && value > constraint.threshold) {
      violated = true;
    } else if (constraint.condition === 'min' && value < constraint.threshold) {
      violated = true;
    }
    
    if (violated) {
      totalPenalty += constraint.penalty;
      reasons.push(constraint.reason);
    }
  }
  
  return {
    violated: totalPenalty > 0,
    penalties: totalPenalty,
    reasons
  };
}

// 加权距离计算（带惩罚机制）
export interface MatchingResult {
  archetype: InvestmentArchetype;
  total_score: number;
  trait_scores: {
    trait: string;
    user_value: number;
    ideal_range: [number, number];
    score: number;
    weight: number;
    weighted_score: number;
  }[];
  math_score: number;
  risk_score: number;
  constraint_penalties: number;
  constraint_reasons: string[];
  final_score: number;
  match_level: '极度匹配' | '高度匹配' | '较为匹配' | '一般匹配' | '不太匹配';
  explanation: string;
}

export function calculateWeightedMatch(
  personalityScores: PersonalityScores,
  mathScore: number,
  riskLevel: number,
  archetype: InvestmentArchetype
): MatchingResult {
  const traitScores: MatchingResult['trait_scores'] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  // 计算每个特征的得分
  const traits: (keyof PersonalityScores)[] = [
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'neuroticism'
  ];
  
  for (const trait of traits) {
    const userValue = personalityScores[trait];
    const idealRange = archetype.ideal_ranges[trait];
    const score = scoreInRange(userValue, idealRange);
    const weight = TRAIT_WEIGHTS[trait];
    const weightedScore = score * weight;
    
    traitScores.push({
      trait: trait === 'openness' ? '开放性' :
             trait === 'conscientiousness' ? '尽责性' :
             trait === 'extraversion' ? '外向性' :
             trait === 'agreeableness' ? '宜人性' : '神经质',
      user_value: userValue,
      ideal_range: idealRange,
      score,
      weight,
      weighted_score: weightedScore
    });
    
    totalWeightedScore += weightedScore;
    totalWeight += weight;
  }
  
  // 计算数学能力得分
  const mathScoreValue = scoreInRange(mathScore, archetype.math_range);
  
  // 计算风险偏好得分
  const riskScoreValue = scoreInRange(riskLevel, archetype.risk_range);
  
  // 综合得分（人格70%，数学15%，风险15%）
  const baseScore = (totalWeightedScore / totalWeight) * 0.7 + mathScoreValue * 0.15 + riskScoreValue * 0.15;
  
  // 检查硬性约束
  const constraintCheck = checkHardConstraints(personalityScores, archetype.hard_constraints);
  
  // 应用惩罚（每个惩罚点扣除10分）
  const finalScore = Math.max(0, baseScore - constraintCheck.penalties * 10);
  
  // 确定匹配等级
  let matchLevel: MatchingResult['match_level'];
  if (finalScore >= 85) {
    matchLevel = '极度匹配';
  } else if (finalScore >= 70) {
    matchLevel = '高度匹配';
  } else if (finalScore >= 55) {
    matchLevel = '较为匹配';
  } else if (finalScore >= 40) {
    matchLevel = '一般匹配';
  } else {
    matchLevel = '不太匹配';
  }
  
  // 生成解释
  let explanation = `您的人格特质与"${archetype.name}"的匹配度为${finalScore.toFixed(1)}分（${matchLevel}）。`;
  
  if (constraintCheck.violated) {
    explanation += `\n\n⚠️ 存在以下不匹配因素：\n${constraintCheck.reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
  }
  
  // 添加优势分析
  const highScores = traitScores.filter(t => t.score >= 80);
  if (highScores.length > 0) {
    explanation += `\n\n✅ 您的优势：\n${highScores.map(t => `• ${t.trait}非常适合（${t.score.toFixed(0)}分）`).join('\n')}`;
  }
  
  // 添加改进建议
  const lowScores = traitScores.filter(t => t.score < 60);
  if (lowScores.length > 0) {
    explanation += `\n\n📊 需要注意：\n${lowScores.map(t => `• ${t.trait}偏离理想区间（${t.score.toFixed(0)}分）`).join('\n')}`;
  }
  
  return {
    archetype,
    total_score: baseScore,
    trait_scores: traitScores,
    math_score: mathScoreValue,
    risk_score: riskScoreValue,
    constraint_penalties: constraintCheck.penalties,
    constraint_reasons: constraintCheck.reasons,
    final_score: finalScore,
    match_level: matchLevel,
    explanation
  };
}

// 匹配所有原型并排序
export function matchAllArchetypes(
  personalityScores: PersonalityScores,
  mathScore: number,
  riskLevel: number
): MatchingResult[] {
  const results: MatchingResult[] = [];
  
  for (const archetype of INVESTMENT_ARCHETYPES) {
    const result = calculateWeightedMatch(personalityScores, mathScore, riskLevel, archetype);
    results.push(result);
  }
  
  // 按最终得分降序排序
  results.sort((a, b) => b.final_score - a.final_score);
  
  return results;
}

// 生成透明的匹配报告
export function generateTransparentReport(results: MatchingResult[]): {
  best_match: MatchingResult;
  all_matches: MatchingResult[];
  summary: string;
} {
  const bestMatch = results[0];
  
  let summary = `## 🎯 投资风格匹配分析\n\n`;
  summary += `### 最佳匹配：${bestMatch.archetype.name}（${bestMatch.final_score.toFixed(1)}分）\n\n`;
  summary += `${bestMatch.explanation}\n\n`;
  summary += `**推荐交易频率：** ${bestMatch.archetype.trading_frequency}\n`;
  summary += `**推荐交易风格：** ${bestMatch.archetype.trading_style}\n`;
  summary += `**建议持仓周期：** ${bestMatch.archetype.holding_period}\n\n`;
  
  summary += `### 📊 详细评分\n\n`;
  summary += `| 特征 | 您的值 | 理想区间 | 得分 | 权重 | 加权得分 |\n`;
  summary += `|------|--------|----------|------|------|----------|\n`;
  
  for (const trait of bestMatch.trait_scores) {
    summary += `| ${trait.trait} | ${trait.user_value} | [${trait.ideal_range[0]}, ${trait.ideal_range[1]}] | ${trait.score.toFixed(0)} | ${trait.weight.toFixed(1)}x | ${trait.weighted_score.toFixed(1)} |\n`;
  }
  
  summary += `\n**数学能力得分：** ${bestMatch.math_score.toFixed(0)}分\n`;
  summary += `**风险偏好得分：** ${bestMatch.risk_score.toFixed(0)}分\n`;
  
  if (bestMatch.constraint_penalties > 0) {
    summary += `**约束惩罚：** -${(bestMatch.constraint_penalties * 10).toFixed(0)}分\n`;
  }
  
  summary += `\n### 🏆 所有风格匹配度排名\n\n`;
  summary += `| 排名 | 投资风格 | 匹配度 | 匹配等级 |\n`;
  summary += `|------|----------|--------|----------|\n`;
  
  results.forEach((result, index) => {
    summary += `| ${index + 1} | ${result.archetype.name} | ${result.final_score.toFixed(1)}分 | ${result.match_level} |\n`;
  });
  
  return {
    best_match: bestMatch,
    all_matches: results,
    summary
  };
}

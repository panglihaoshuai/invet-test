// 交易者画像分析工具

export interface TraderProfile {
  profileType: string; // 交易者类型
  profileIcon: string; // 图标
  profileDescription: string; // 描述
  strengths: string[]; // 优势
  weaknesses: string[]; // 劣势
  recommendations: string[]; // 建议
  riskLevel: 'low' | 'medium' | 'high'; // 风险等级
  tradingStyle: string; // 交易风格
  emotionalControl: 'poor' | 'fair' | 'good' | 'excellent'; // 情绪控制
  decisionSpeed: 'slow' | 'moderate' | 'fast' | 'very-fast'; // 决策速度
  scores: {
    riskTolerance: number; // 风险承受能力 0-100
    patience: number; // 耐心 0-100
    emotionalStability: number; // 情绪稳定性 0-100
    independence: number; // 独立思考 0-100
    discipline: number; // 纪律性 0-100
  };
}

export function generateTraderProfile(): TraderProfile {
  // 收集所有测试和游戏数据
  const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
  const balloonResults = JSON.parse(localStorage.getItem('balloonResults') || '[]');
  const harvestResult = JSON.parse(localStorage.getItem('harvestResults') || '{}');
  const auctionResult = JSON.parse(localStorage.getItem('auctionResult') || '{}');
  const twoDoorsResult = JSON.parse(localStorage.getItem('twoDoorsResult') || '{}');
  const herdResult = JSON.parse(localStorage.getItem('herdResult') || '{}');
  const quickReactionResult = JSON.parse(localStorage.getItem('quickReactionResult') || '{}');

  // 初始化分数
  let riskTolerance = 50;
  let patience = 50;
  let emotionalStability = 50;
  let independence = 50;
  let discipline = 50;

  // 分析气球游戏
  if (balloonResults.length > 0) {
    const latestBalloon = balloonResults[balloonResults.length - 1];
    riskTolerance = latestBalloon.riskScore || 50;
  }

  // 分析等待收获游戏
  if (harvestResult.patienceScore) {
    patience = harvestResult.patienceScore;
    discipline = harvestResult.disciplineScore || 50;
  }

  // 分析拍卖竞价游戏
  if (auctionResult.greedScore) {
    emotionalStability = Math.max(0, 100 - auctionResult.greedScore);
  }

  // 分析双门选择游戏
  if (twoDoorsResult.riskTolerance) {
    riskTolerance = (riskTolerance + twoDoorsResult.riskTolerance) / 2;
  }

  // 分析群体羊群游戏
  if (herdResult.herdScore !== undefined) {
    independence = 100 - herdResult.herdScore;
  }

  // 分析快速反应游戏
  if (quickReactionResult.emotionControl) {
    emotionalStability = (emotionalStability + Math.min(100, quickReactionResult.emotionControl)) / 2;
  }

  // 分析测试结果
  if (testResults.length > 0) {
    const latestTest = testResults[testResults.length - 1];
    
    // 从人格测试中提取信息
    if (latestTest.personalityScores) {
      const scores = latestTest.personalityScores;
      emotionalStability = (emotionalStability + (scores.neuroticism ? 100 - scores.neuroticism : 50)) / 2;
      discipline = (discipline + (scores.conscientiousness || 50)) / 2;
    }

    // 从风险偏好测试中提取信息
    if (latestTest.riskPreference) {
      const riskScore = latestTest.riskPreference.score || 50;
      riskTolerance = (riskTolerance + riskScore) / 2;
    }
  }

  // 确定交易者类型
  const profileType = determineProfileType({
    riskTolerance,
    patience,
    emotionalStability,
    independence,
    discipline
  });

  // 确定风险等级
  const riskLevel = riskTolerance > 70 ? 'high' : riskTolerance > 40 ? 'medium' : 'low';

  // 确定交易风格
  const tradingStyle = determineTradingStyle({
    riskTolerance,
    patience,
    emotionalStability,
    independence,
    discipline
  });

  // 确定情绪控制
  const emotionalControl = emotionalStability > 75 ? 'excellent' : 
                          emotionalStability > 60 ? 'good' : 
                          emotionalStability > 40 ? 'fair' : 'poor';

  // 确定决策速度
  const decisionSpeed = quickReactionResult.speedScore > 70 ? 'very-fast' :
                       quickReactionResult.speedScore > 50 ? 'fast' :
                       quickReactionResult.speedScore > 30 ? 'moderate' : 'slow';

  // 生成优势、劣势和建议
  const { strengths, weaknesses, recommendations } = generateInsights({
    riskTolerance,
    patience,
    emotionalStability,
    independence,
    discipline,
    profileType
  });

  return {
    profileType: profileType.name,
    profileIcon: profileType.icon,
    profileDescription: profileType.description,
    strengths,
    weaknesses,
    recommendations,
    riskLevel,
    tradingStyle,
    emotionalControl,
    decisionSpeed,
    scores: {
      riskTolerance,
      patience,
      emotionalStability,
      independence,
      discipline
    }
  };
}

function determineProfileType(scores: any) {
  const { riskTolerance, patience, emotionalStability, independence, discipline } = scores;

  // 保守型投资者
  if (riskTolerance < 40 && patience > 60 && discipline > 60) {
    return {
      name: '保守型投资者',
      icon: '🛡️',
      description: '您倾向于稳健投资，注重资本保护，适合长期价值投资'
    };
  }

  // 激进型交易者
  if (riskTolerance > 70 && emotionalStability < 50) {
    return {
      name: '激进型交易者',
      icon: '🚀',
      description: '您追求高风险高回报，但需要提升情绪控制能力'
    };
  }

  // 理性分析师
  if (independence > 70 && emotionalStability > 70 && discipline > 60) {
    return {
      name: '理性分析师',
      icon: '🧠',
      description: '您善于独立思考，情绪稳定，适合系统化交易'
    };
  }

  // 从众跟随者
  if (independence < 40 && emotionalStability < 50) {
    return {
      name: '从众跟随者',
      icon: '👥',
      description: '您容易受他人影响，建议培养独立判断能力'
    };
  }

  // 冲动交易者
  if (riskTolerance > 60 && patience < 40 && discipline < 50) {
    return {
      name: '冲动交易者',
      icon: '⚡',
      description: '您决策迅速但缺乏耐心，需要提升纪律性'
    };
  }

  // 谨慎观望者
  if (riskTolerance < 50 && patience > 50 && independence > 50) {
    return {
      name: '谨慎观望者',
      icon: '🔍',
      description: '您善于观察等待，但可能错失机会'
    };
  }

  // 平衡型投资者
  return {
    name: '平衡型投资者',
    icon: '⚖️',
    description: '您在各方面表现均衡，适合多元化投资策略'
  };
}

function determineTradingStyle(scores: any) {
  const { riskTolerance, patience, emotionalStability } = scores;

  if (patience > 70 && riskTolerance < 50) {
    return '长线价值投资';
  } else if (patience > 50 && riskTolerance > 40 && riskTolerance < 70) {
    return '波段交易';
  } else if (patience < 40 && riskTolerance > 60) {
    return '日内短线交易';
  } else if (emotionalStability > 70 && riskTolerance > 50) {
    return '趋势跟踪';
  } else {
    return '混合策略';
  }
}

function generateInsights(data: any) {
  const { riskTolerance, patience, emotionalStability, independence, discipline } = data;
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // 分析优势
  if (riskTolerance > 60) {
    strengths.push('敢于承担风险，把握高收益机会');
  }
  if (patience > 60) {
    strengths.push('耐心等待，不急于求成');
  }
  if (emotionalStability > 60) {
    strengths.push('情绪稳定，不易受市场波动影响');
  }
  if (independence > 60) {
    strengths.push('独立思考，不盲目跟风');
  }
  if (discipline > 60) {
    strengths.push('纪律性强，严格执行计划');
  }

  // 分析劣势
  if (riskTolerance < 40) {
    weaknesses.push('风险承受能力较低，可能错失机会');
  }
  if (patience < 40) {
    weaknesses.push('缺乏耐心，容易频繁交易');
  }
  if (emotionalStability < 40) {
    weaknesses.push('情绪波动大，易受市场情绪影响');
  }
  if (independence < 40) {
    weaknesses.push('容易从众，缺乏独立判断');
  }
  if (discipline < 40) {
    weaknesses.push('纪律性不足，难以坚持策略');
  }

  // 生成建议
  if (emotionalStability < 50) {
    recommendations.push('建立交易日志，记录每次决策的情绪状态');
    recommendations.push('设置止损止盈，避免情绪化决策');
  }
  if (patience < 50) {
    recommendations.push('制定明确的交易计划，减少冲动交易');
    recommendations.push('尝试长线投资，培养耐心');
  }
  if (independence < 50) {
    recommendations.push('独立分析市场，不盲目跟随他人');
    recommendations.push('建立自己的交易系统和判断标准');
  }
  if (discipline < 50) {
    recommendations.push('严格执行交易计划，不随意改变策略');
    recommendations.push('设置交易规则，并坚持遵守');
  }
  if (riskTolerance > 70) {
    recommendations.push('注意风险控制，不要过度杠杆');
    recommendations.push('分散投资，降低单一风险');
  }

  // 如果没有明显劣势，给出通用建议
  if (weaknesses.length === 0) {
    weaknesses.push('各方面表现均衡，继续保持');
  }
  if (recommendations.length === 0) {
    recommendations.push('继续学习和实践，不断优化策略');
    recommendations.push('定期回顾交易记录，总结经验教训');
  }

  return { strengths, weaknesses, recommendations };
}

export function hasEnoughDataForProfile(): boolean {
  const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
  const completedGames = JSON.parse(localStorage.getItem('completedGames') || '[]');
  
  // 至少需要完成一次测试或一个游戏
  return testResults.length > 0 || completedGames.length >= 1;
}

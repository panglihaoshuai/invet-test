// 数据库表类型定义

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface TestResult {
  id: string;
  user_id: string;
  personality_scores: PersonalityScores | null;
  math_finance_scores: MathFinanceScores | null;
  risk_preference_scores: RiskPreferenceScores | null;
  trading_characteristics: TradingCharacteristics | null;
  investment_style: string | null;
  euclidean_distance: number | null;
  completed_at: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  test_result_id: string;
  report_data: ReportData | null;
  expires_at: string;
  created_at: string;
}

// 测试相关类型

export interface PersonalityScores {
  openness: number; // 开放性
  conscientiousness: number; // 尽责性
  extraversion: number; // 外向性
  agreeableness: number; // 宜人性
  neuroticism: number; // 神经质
}

export interface MathFinanceScores {
  total_score: number;
  correct_answers: number;
  total_questions: number;
  percentage: number;
}

export interface RiskPreferenceScores {
  risk_tolerance: number; // 风险容忍度 (1-10)
  investment_horizon: string; // 投资期限
  loss_aversion: number; // 损失厌恶程度
}

export interface TradingCharacteristics {
  trading_frequency: string; // 交易频率
  preferred_instruments: string; // 偏好的投资标的
  analysis_method: string; // 分析方法
  technical_preference: string; // 技术分析偏好
  decision_basis: string; // 决策依据
  investment_philosophy: string; // 投资理念
  learning_style: string; // 学习方式
  portfolio_approach: string; // 组合管理方式
}

export interface ReportData {
  user_email: string;
  test_date: string;
  personality_analysis: string;
  math_finance_analysis: string;
  risk_analysis: string;
  trading_characteristics_analysis: string;
  recommended_strategy: string;
  investment_style: string;
  detailed_recommendations: string[];
}

// 投资风格向量定义
export interface InvestmentStyleVector {
  name: string;
  description: string;
  personality_vector: PersonalityScores;
  min_math_score: number;
  risk_level: number;
}

// 问题类型
export interface Question {
  id: string;
  text: string;
  type: 'likert' | 'multiple_choice' | 'scenario';
  options?: string[];
  trait?: keyof PersonalityScores;
}

// 测试进度
export interface TestProgress {
  current_step: number;
  total_steps: number;
  completed_tests: string[];
}

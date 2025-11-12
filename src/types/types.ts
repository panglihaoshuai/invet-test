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

export interface GameResult {
  id: string;
  user_id?: string;
  game_type: string;
  score: number;
  game_data: any;
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
  type: 'likert' | 'multiple_choice' | 'scenario' | 'multiple_select';
  options?: string[];
  trait?: keyof PersonalityScores;
}

// 测试进度
export interface TestProgress {
  current_step: number;
  total_steps: number;
  completed_tests: string[];
}

// 订单状态类型
export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

// 订单项类型
export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

// 订单类型
export interface Order {
  id: string;
  user_id: string | null;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: OrderStatus;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  test_result_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// DeepSeek分析类型
export interface DeepSeekAnalysis {
  id: string;
  user_id: string;
  test_result_id: string;
  order_id: string;
  analysis_content: string;
  prompt_used: string;
  test_data_summary: any;
  created_at: string;
}

// 管理员系统类型
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestSubmission {
  id: string;
  user_id: string | null;
  test_type: string;
  ip_address: string | null;
  user_agent: string | null;
  country: string | null;
  city: string | null;
  completed: boolean;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
}

export interface AdminStatistics {
  total_tests: number;
  unique_users: number;
  total_payments: number;
  total_revenue: number;
  tests_today: number;
  payments_today: number;
  first_time_purchases: number;
  second_time_purchases: number;
  repeat_purchases: number;
}

export interface UserPricingInfo {
  user_id: string;
  email: string;
  completed_analyses: number;
  next_price: number;
}


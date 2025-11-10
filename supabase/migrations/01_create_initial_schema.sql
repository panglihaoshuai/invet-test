/*
# Create Initial Database Schema for Personality Investment System

## 1. New Tables

### users table
- `id` (uuid, primary key, auto-generated)
- `email` (text, unique, not null) - 用户邮箱
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### verification_codes table
- `id` (uuid, primary key, auto-generated)
- `email` (text, not null) - 接收验证码的邮箱
- `code` (text, not null) - 6位数字验证码
- `expires_at` (timestamptz, not null) - 过期时间(5分钟后)
- `used` (boolean, default: false) - 是否已使用
- `created_at` (timestamptz, default: now())

### test_results table
- `id` (uuid, primary key, auto-generated)
- `user_id` (uuid, references users.id)
- `personality_scores` (jsonb) - 人格测试分数 (Big Five)
- `math_finance_scores` (jsonb) - 数学金融能力分数
- `risk_preference_scores` (jsonb) - 风险偏好分数
- `investment_style` (text) - 推荐的投资风格
- `euclidean_distance` (numeric) - 欧几里得距离
- `completed_at` (timestamptz, default: now())
- `created_at` (timestamptz, default: now())

### reports table
- `id` (uuid, primary key, auto-generated)
- `user_id` (uuid, references users.id)
- `test_result_id` (uuid, references test_results.id)
- `report_data` (jsonb) - 报告数据
- `expires_at` (timestamptz, not null) - 报告过期时间(24小时后)
- `created_at` (timestamptz, default: now())

## 2. Security
- No RLS enabled - public access for assessment system
- All tables are publicly accessible for read/write operations
- Verification codes auto-expire after 5 minutes
- Reports auto-expire after 24 hours

## 3. Indexes
- Index on verification_codes.email for fast lookup
- Index on test_results.user_id for user history
- Index on reports.expires_at for cleanup queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  personality_scores jsonb,
  math_finance_scores jsonb,
  risk_preference_scores jsonb,
  investment_style text,
  euclidean_distance numeric,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  test_result_id uuid REFERENCES test_results(id) ON DELETE CASCADE,
  report_data jsonb,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_expires_at ON reports(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

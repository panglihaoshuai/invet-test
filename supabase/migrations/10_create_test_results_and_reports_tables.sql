/*
# Create test_results and reports tables

## test_results table
- `id` (uuid, primary key, auto-generated)
- `user_id` (uuid, references users.id)
- `personality_scores` (jsonb) - 人格测试分数 (Big Five)
- `math_finance_scores` (jsonb) - 数学金融能力分数
- `risk_preference_scores` (jsonb) - 风险偏好分数
- `investment_style` (text) - 推荐的投资风格
- `euclidean_distance` (numeric) - 欧几里得距离
- `completed_at` (timestamptz, default: now())
- `created_at` (timestamptz, default: now())

## reports table
- `id` (uuid, primary key, auto-generated)
- `user_id` (uuid, references users.id)
- `test_result_id` (uuid, references test_results.id)
- `report_data` (jsonb) - 报告数据
- `expires_at` (timestamptz, not null) - 报告过期时间(24小时后)
- `created_at` (timestamptz, default: now())

## Security
- No RLS enabled - public access for assessment system
- Reports auto-expire after 24 hours

## Indexes
- Index on test_results.user_id for user history
- Index on reports.user_id and expires_at for queries
*/

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
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_expires_at ON reports(expires_at);

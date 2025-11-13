/*
# Create verification_codes table

## Table Structure
- `id` (uuid, primary key, auto-generated)
- `email` (text, not null) - 接收验证码的邮箱
- `code` (text, not null) - 6位数字验证码
- `expires_at` (timestamptz, not null) - 过期时间(5分钟后)
- `used` (boolean, default: false) - 是否已使用
- `created_at` (timestamptz, default: now())

## Security
- No RLS enabled - public access for login system
- Verification codes auto-expire after 5 minutes

## Indexes
- Index on email for fast lookup
- Index on expires_at for cleanup queries
*/

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

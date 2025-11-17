ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

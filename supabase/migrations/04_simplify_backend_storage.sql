/*
# Simplify Backend Storage - Local Storage Architecture

## Changes
This migration simplifies the backend to only handle:
1. User authentication (users table)
2. Payment processing (orders table)
3. DeepSeek analyses (deepseek_analyses table)

Test results and game history are now stored locally in the browser.

## Removed Tables
- test_results (moved to localStorage)
- game_results (moved to localStorage)
- reports (no longer needed)
- verification_codes (handled by Supabase Auth)

## Modified Tables
- orders: Remove test_result_id foreign key constraint
- deepseek_analyses: Remove test_result_id foreign key constraint

## Notes
- Users' test data is stored locally for privacy
- Only payment and AI analysis use the backend
- Users are notified about local storage and data backup
*/

-- Drop foreign key constraints that reference test_results
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_test_result_id_fkey;
ALTER TABLE IF EXISTS deepseek_analyses DROP CONSTRAINT IF EXISTS deepseek_analyses_test_result_id_fkey;

-- Drop tables that are no longer needed
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS verification_codes CASCADE;

-- Update orders table comment
COMMENT ON TABLE orders IS 'Payment orders - test_result_id is a reference ID only, actual test data is stored locally';

-- Update deepseek_analyses table comment
COMMENT ON TABLE deepseek_analyses IS 'DeepSeek AI analyses - test_result_id is a reference ID only, test_data_summary contains the actual test data';

-- Add index on test_result_id for faster lookups (even though it's not a foreign key)
CREATE INDEX IF NOT EXISTS idx_orders_test_result_id ON orders(test_result_id);
CREATE INDEX IF NOT EXISTS idx_deepseek_analyses_test_result_id ON deepseek_analyses(test_result_id);

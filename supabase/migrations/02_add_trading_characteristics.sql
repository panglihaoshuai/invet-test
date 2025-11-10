/*
# Add Trading Characteristics Column

1. Schema Changes
  - Add `trading_characteristics` column to `test_results` table
  - Type: jsonb (to store TradingCharacteristics object)
  - Nullable: true (optional field)

2. Purpose
  - Store user's trading habits, preferences, and investment philosophy
  - Includes: trading frequency, preferred instruments, analysis method, technical preference, decision basis, investment philosophy, learning style, portfolio approach

3. Notes
  - This enhances the personality assessment with specific trading behavior data
  - Helps provide more accurate investment strategy recommendations
*/

ALTER TABLE test_results
ADD COLUMN IF NOT EXISTS trading_characteristics jsonb;

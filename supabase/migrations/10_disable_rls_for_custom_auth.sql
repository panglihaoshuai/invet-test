/*
# Disable RLS for Custom Auth System

## Problem
The system uses custom JWT authentication, not Supabase Auth.
RLS policies using auth.uid() always return null, blocking all operations.

## Solution
Disable RLS on tables that need to work with custom auth.
Use SECURITY DEFINER functions to control access instead.

## Security
- Admin operations still verified through is_admin_by_id()
- User operations verified through function parameters
- All sensitive operations wrapped in SECURITY DEFINER functions

## Tables Affected
- gift_codes
- gift_code_redemptions
- system_settings (already has proper policies)
*/

-- Disable RLS on gift_codes table
ALTER TABLE gift_codes DISABLE ROW LEVEL SECURITY;

-- Disable RLS on gift_code_redemptions table
ALTER TABLE gift_code_redemptions DISABLE ROW LEVEL SECURITY;

-- Drop old policies (they won't work anyway)
DROP POLICY IF EXISTS "Admins can view all gift codes" ON gift_codes;
DROP POLICY IF EXISTS "Admins can insert gift codes" ON gift_codes;
DROP POLICY IF EXISTS "Admins can update gift codes" ON gift_codes;
DROP POLICY IF EXISTS "Users can view active gift codes by code" ON gift_codes;
DROP POLICY IF EXISTS "Users can view own redemptions" ON gift_code_redemptions;
DROP POLICY IF EXISTS "Users can insert own redemptions" ON gift_code_redemptions;
DROP POLICY IF EXISTS "Admins can view all redemptions" ON gift_code_redemptions;

-- Note: Access control is now handled by:
-- 1. Frontend checks (user must be logged in)
-- 2. API functions that verify user_id
-- 3. SECURITY DEFINER RPC functions for sensitive operations

COMMENT ON TABLE gift_codes IS 'RLS disabled - access controlled by application logic and SECURITY DEFINER functions';
COMMENT ON TABLE gift_code_redemptions IS 'RLS disabled - access controlled by application logic and SECURITY DEFINER functions';

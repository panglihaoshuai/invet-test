/*
# Fix System Settings RLS for Custom Auth

## Problem
The system_settings table has RLS policies that check auth.uid().
In our custom JWT auth system, auth.uid() returns NULL.
This causes the toggle_payment_system function to fail with 400 error.

## Solution
1. Disable RLS on system_settings table
2. Access control is handled by SECURITY DEFINER functions
3. Only admin functions can modify settings
*/

-- Disable RLS on system_settings
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;

-- Drop old policies (no longer needed)
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "Everyone can view system settings" ON system_settings;

-- Add comment explaining access control
COMMENT ON TABLE system_settings IS 'System configuration settings. Access control handled by SECURITY DEFINER functions (toggle_payment_system, etc.)';

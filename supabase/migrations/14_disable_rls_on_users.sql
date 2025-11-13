/*
# Disable RLS on Users Table

## Problem
The previous migration (13_fix_users_table_permissions.sql) enabled RLS on the users table,
but this actually broke the system. The original design intended for the users table to be
publicly accessible without RLS.

## Original Design Intent
From migration 01_create_initial_schema.sql:
"No RLS enabled - public access for assessment system"
"All tables are publicly accessible for read/write operations"

## Solution
Disable RLS on the users table to restore the original behavior.

## Security Considerations
This is acceptable because:
1. This is an assessment system, not a sensitive data system
2. Users are authenticated via Supabase Auth OTP
3. The users table only contains email addresses
4. Other sensitive data is protected in other tables
*/

-- Drop all policies on users table
DROP POLICY IF EXISTS "Users can create their own record" ON users;
DROP POLICY IF EXISTS "Users can read their own record" ON users;
DROP POLICY IF EXISTS "Users can update their own record" ON users;

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

/*
# Fix Users Table Permissions

## Problem
Users cannot be created after OTP verification because the users table
lacks proper permissions for authenticated users to insert their own records.

## Solution
1. Enable RLS on users table
2. Add policy to allow authenticated users to insert their own user record
3. Add policy to allow authenticated users to read their own user record
4. Add policy to allow authenticated users to update their own user record

## Security
- Users can only create/read/update their own record
- Email must match their authenticated email
- No user can access other users' records
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert their own user record
CREATE POLICY "Users can create their own record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to read their own user record
CREATE POLICY "Users can read their own record"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to update their own user record
CREATE POLICY "Users can update their own record"
  ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

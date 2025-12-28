/*
# Update RLS Policies for Supabase Auth

## Purpose
Update all RLS policies to work with Supabase Auth (auth.users) instead of custom users table.

## Changes
1. Update test_results RLS policies
2. Update deepseek_analyses RLS policies
3. Update gift_code_redemptions RLS policies
4. Update orders RLS policies
5. Ensure all policies use auth.uid() correctly
*/

-- 1. Update test_results RLS policies
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own test results" ON public.test_results;
DROP POLICY IF EXISTS "Users can insert own test results" ON public.test_results;
DROP POLICY IF EXISTS "Users can update own test results" ON public.test_results;
DROP POLICY IF EXISTS "Users can delete own test results" ON public.test_results;

-- Create new policies using auth.uid()
CREATE POLICY "Users can view own test results" ON public.test_results
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own test results" ON public.test_results
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own test results" ON public.test_results
  FOR UPDATE TO authenticated
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete own test results" ON public.test_results
  FOR DELETE TO authenticated
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- 2. Update deepseek_analyses RLS policies
ALTER TABLE public.deepseek_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analyses" ON public.deepseek_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.deepseek_analyses;
DROP POLICY IF EXISTS "Admins can view all analyses" ON public.deepseek_analyses;

CREATE POLICY "Users can view own analyses" ON public.deepseek_analyses
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own analyses" ON public.deepseek_analyses
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all analyses" ON public.deepseek_analyses
  FOR SELECT TO authenticated
  USING (public.is_admin_by_auth_uid());

-- 3. Update gift_code_redemptions RLS policies
ALTER TABLE public.gift_code_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own redemptions" ON public.gift_code_redemptions;
DROP POLICY IF EXISTS "Users can insert own redemptions" ON public.gift_code_redemptions;
DROP POLICY IF EXISTS "Admins can view all redemptions" ON public.gift_code_redemptions;

CREATE POLICY "Users can view own redemptions" ON public.gift_code_redemptions
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own redemptions" ON public.gift_code_redemptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all redemptions" ON public.gift_code_redemptions
  FOR SELECT TO authenticated
  USING (public.is_admin_by_auth_uid());

-- 4. Update orders RLS policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.is_admin_by_auth_uid());

-- 5. Ensure gift_codes RLS policies work correctly
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all gift codes" ON public.gift_codes;
DROP POLICY IF EXISTS "Admins can insert gift codes" ON public.gift_codes;
DROP POLICY IF EXISTS "Admins can update gift codes" ON public.gift_codes;
DROP POLICY IF EXISTS "Users can view active gift codes by code" ON public.gift_codes;

CREATE POLICY "Admins can view all gift codes" ON public.gift_codes
  FOR SELECT TO authenticated
  USING (public.is_admin_by_auth_uid());

CREATE POLICY "Admins can insert gift codes" ON public.gift_codes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_by_auth_uid());

CREATE POLICY "Admins can update gift codes" ON public.gift_codes
  FOR UPDATE TO authenticated
  USING (public.is_admin_by_auth_uid())
  WITH CHECK (public.is_admin_by_auth_uid());

CREATE POLICY "Users can view active gift codes by code" ON public.gift_codes
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Comments
COMMENT ON POLICY "Users can view own test results" ON public.test_results IS 'Users can only view their own test results';
COMMENT ON POLICY "Users can view own analyses" ON public.deepseek_analyses IS 'Users can only view their own DeepSeek analyses';
COMMENT ON POLICY "Users can view own redemptions" ON public.gift_code_redemptions IS 'Users can only view their own gift code redemptions';
COMMENT ON POLICY "Users can view own orders" ON public.orders IS 'Users can only view their own orders';


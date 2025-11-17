/*
# Disable RLS for Custom Auth System (renumbered)
*/
ALTER TABLE gift_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE gift_code_redemptions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all gift codes" ON gift_codes;
DROP POLICY IF EXISTS "Admins can insert gift codes" ON gift_codes;
DROP POLICY IF EXISTS "Admins can update gift codes" ON gift_codes;
DROP POLICY IF EXISTS "Users can view active gift codes by code" ON gift_codes;
DROP POLICY IF EXISTS "Users can view own redemptions" ON gift_code_redemptions;
DROP POLICY IF EXISTS "Users can insert own redemptions" ON gift_code_redemptions;
DROP POLICY IF EXISTS "Admins can view all redemptions" ON gift_code_redemptions;
COMMENT ON TABLE gift_codes IS 'RLS disabled - access controlled by application logic and SECURITY DEFINER functions';
COMMENT ON TABLE gift_code_redemptions IS 'RLS disabled - access controlled by application logic and SECURITY DEFINER functions';

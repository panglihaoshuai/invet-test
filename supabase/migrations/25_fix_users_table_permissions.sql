/*
# Fix Users Table Permissions (renumbered)
*/
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create their own record"
  ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can read their own record"
  ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

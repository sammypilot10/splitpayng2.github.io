-- ============================================================
-- COMPLETE RLS HARDENING FOR PRODUCTION
-- Run this in Supabase SQL Editor
-- ============================================================

-- PROFILES TABLE
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own non-sensitive profile fields"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- POOLS TABLE
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public active pools" ON pools;
DROP POLICY IF EXISTS "Hosts can manage own pools" ON pools;

CREATE POLICY "Anyone can view public active pools"
ON pools FOR SELECT
USING (is_public = true AND status = 'active');

CREATE POLICY "Hosts can view all their own pools including private"
ON pools FOR SELECT
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can insert their own pools"
ON pools FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own pools"
ON pools FOR UPDATE
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

-- TRANSACTIONS TABLE
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

-- PAYOUTS TABLE
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payouts" ON payouts;

CREATE POLICY "Users can view own payouts"
ON payouts FOR SELECT
USING (auth.uid() = user_id);

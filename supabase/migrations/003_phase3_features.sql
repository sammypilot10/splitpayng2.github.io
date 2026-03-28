-- supabase/migrations/003_phase3_features.sql
-- Run this in your Supabase SQL Editor to support the 8 new features

-- ============================================================
-- 1. pool_members: Add columns for billing lifecycle & status
-- ============================================================

-- Status column for membership lifecycle (escrow → active → past_due → cancelled)
ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'escrow';

-- Next billing date for recurring charges & cron reminders
ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ;

-- ============================================================
-- 2. profiles: Add balance column for host wallet (20% fee logic)
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0;

-- ============================================================
-- 3. profiles: Add payout bank details for host withdrawals
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_name TEXT;

-- ============================================================
-- 4. transactions: Create table for payment audit trail
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  reference TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. RPC: Atomic seat incrementer (used by webhook)
-- ============================================================

CREATE OR REPLACE FUNCTION increment_pool_seats(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pools 
  SET current_seats = current_seats + 1 
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

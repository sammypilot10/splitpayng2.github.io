-- Create payouts table (used for withdrawal history)
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own payouts
CREATE POLICY "Users can view own payouts"
ON payouts FOR SELECT
USING (auth.uid() = user_id);

-- Create audit_logs table (used for admin trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_table TEXT,
  entity_id TEXT,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add paystack_auth_code column to pool_members if missing
ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS paystack_auth_code TEXT;

-- Add bank_name column to profiles if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;

-- Ensure status column on pool_members accepts 'escrow'
-- (already TEXT type so 'escrow' value is valid at DB level)

-- Invite tokens for private pools
ALTER TABLE pools ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE;

-- Card tokenization for members
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_last4 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_verified BOOLEAN DEFAULT FALSE;

-- Payout verification flag
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payout_verified BOOLEAN DEFAULT FALSE;

-- Subscription lifecycle on memberships
ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS renewal_notification_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- supabase/migrations/011_add_reminder_flag.sql

-- Add an idempotent state tracker to prevent the Vercel cron from accidentally
-- spamming the same user multiple times over the 3-day billing period.

ALTER TABLE pool_members 
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

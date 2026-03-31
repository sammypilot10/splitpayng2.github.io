-- supabase/migrations/005_add_pool_host_metadata.sql
-- Adds host metadata columns to the pools table so the CreatePoolWizard
-- can denormalize the host's username and WhatsApp number onto each pool.
-- This fixes: "Could not find the 'host_username' column of 'pools' in the schema cache"

ALTER TABLE pools ADD COLUMN IF NOT EXISTS host_username TEXT;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS host_whatsapp TEXT;

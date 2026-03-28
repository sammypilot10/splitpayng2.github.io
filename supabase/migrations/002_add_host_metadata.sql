-- supabase/migrations/002_add_host_metadata.sql
-- Run this in your Supabase SQL Editor to add the required columns for Phase 3

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

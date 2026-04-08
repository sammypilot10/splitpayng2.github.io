-- supabase/migrations/010_single_session.sql

-- Single Device Session Lock
-- This trigger automatically intercepts every new login event in the Supabase 'auth.sessions' table.
-- When a user logs in from a new device/browser, it deletes all older sessions linked to their UUID.
-- This forces the old device's JWT token to invalidate silently, acting as a strict single concurrent session lock.

CREATE OR REPLACE FUNCTION wipe_old_sessions()
RETURNS trigger AS $$
BEGIN
  -- Delete all other sessions belonging to this user except the newly created one
  DELETE FROM auth.sessions 
  WHERE user_id = NEW.user_id 
  AND id != NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists to ensure idempotency
DROP TRIGGER IF EXISTS enforce_single_session_trigger ON auth.sessions;

CREATE TRIGGER enforce_single_session_trigger
AFTER INSERT ON auth.sessions
FOR EACH ROW
EXECUTE FUNCTION wipe_old_sessions();

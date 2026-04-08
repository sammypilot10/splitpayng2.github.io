-- supabase/migrations/007_webhook_idempotency.sql

-- This function enforces strict idempotency for financial webhooks by leveraging
-- row-level locks and atomic updates. It prevents TOCTOU race conditions where
-- multiple simultaneous webhooks for the same transaction might trigger multiple pool join events.

CREATE OR REPLACE FUNCTION mark_transaction_successful(p_reference text)
RETURNS boolean AS $$
DECLARE
  v_updated boolean;
BEGIN
  -- Perform an atomic update that only succeeds if the status is NOT already 'success'
  -- We don't need 'FOR UPDATE' lock since UPDATE itself locks the row during the operation.
  UPDATE transactions
  SET status = 'success'
  WHERE reference = p_reference AND status != 'success'
  RETURNING true INTO v_updated;

  -- If a row was updated, v_updated will be true. If no rows were updated (e.g. it was already 'success'), 
  -- GET DIAGNOSTICS or the RETURNING clause handles it. But actually, RETURNING into strict variable 
  -- might throw if 0 rows are returned. 
  
  -- The safest way in plpgsql to return true if 1 row updated:
  IF FOUND THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

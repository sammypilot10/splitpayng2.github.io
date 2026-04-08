-- supabase/migrations/006_add_balance_rpc.sql
-- Adds an atomic balance adjustment function to prevent race conditions during concurrent payouts and refunds.

CREATE OR REPLACE FUNCTION adjust_profile_balance(p_user_id uuid, p_amount_delta numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance numeric;
BEGIN
  -- Perform an atomic update on the user's balance.
  -- COALESCE ensures we don't end up with NULL if the balance was initially NULL.
  UPDATE profiles
  SET balance = COALESCE(balance, 0) + p_amount_delta
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;

  RETURN v_new_balance;
END;
$$;

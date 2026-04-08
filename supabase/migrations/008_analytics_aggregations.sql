-- supabase/migrations/008_analytics_aggregations.sql

-- Fast RPC aggregation for calculating the total Gross Merchandise Value (GMV)
-- This eliminates the need to pull all transactions into Next.js memory,
-- preventing server RAM overflow as the platform scales.

CREATE OR REPLACE FUNCTION get_total_gmv()
RETURNS bigint AS $$
DECLARE
  v_total bigint;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total
  FROM transactions
  WHERE status = 'success';
  
  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- supabase/migrations/004_rls_hardening.sql
-- Mandatory security lockdown before public launch (Idempotent Version)

-- 1. Enable RLS on core tables if not already enabled
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_credentials ENABLE ROW LEVEL SECURITY;

-- 2. Hardening `pool_members`
-- Clean up existing policies first to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own memberships" ON pool_members;
DROP POLICY IF EXISTS "Hosts can view members of their pools" ON pool_members;

-- Members can only see their own memberships
CREATE POLICY "Users can view their own memberships" 
ON pool_members FOR SELECT 
USING (auth.uid() = member_id);

-- Hosts can view members of their pools
CREATE POLICY "Hosts can view members of their pools" 
ON pool_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM pools 
    WHERE pools.id = pool_members.pool_id 
    AND pools.host_id = auth.uid()
  )
);

-- 3. Hardening `pool_credentials` (The Vault)
-- Clean up existing policies first to prevent conflicts
DROP POLICY IF EXISTS "Actives members can view credentials" ON pool_credentials;
DROP POLICY IF EXISTS "Hosts can view own credentials" ON pool_credentials;

-- Only active/confirmed members can view the credentials for a pool
CREATE POLICY "Actives members can view credentials" 
ON pool_credentials FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM pool_members 
    WHERE pool_members.pool_id = pool_credentials.pool_id
    AND pool_members.member_id = auth.uid()
    AND pool_members.escrow_status IN ('confirmed', 'disputed') -- Still readable if disputed so they can prove it
  )
);

-- Hosts can view their own credentials they uploaded
CREATE POLICY "Hosts can view own credentials" 
ON pool_credentials FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM pools 
    WHERE pools.id = pool_credentials.pool_id 
    AND pools.host_id = auth.uid()
  )
);

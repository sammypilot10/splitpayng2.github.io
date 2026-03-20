// src/lib/escrow.ts
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

// Define exactly what the update payload looks like
type MemberUpdate = Database['public']['Tables']['pool_members']['Update']

export async function confirmAccess(membershipId: string) {
  const supabase = createClient()
  const payload: MemberUpdate = { escrow_status: 'confirmed' }
  
  const { error } = await supabase
    .from('pool_members')
    .update(payload as never)
    .eq('id', membershipId)
  
  if (error) throw new Error(error.message)
  return true
}

export async function disputeAccess(membershipId: string) {
  const supabase = createClient()
  const payload: MemberUpdate = { escrow_status: 'disputed' }

  const { error } = await supabase
    .from('pool_members')
    .update(payload as never)
    .eq('id', membershipId)
  
  if (error) throw new Error(error.message)
  return true
}
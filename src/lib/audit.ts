// src/lib/audit.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// Used by Admin Dashboard (from Step 6)
export async function logAdminAction(action: string, targetTable: string, targetId: string, details?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action,
    entity_table: targetTable,
    entity_id: targetId,
    new_data: { details }
  } as any)
}

// Used by the System/Billing Cron Jobs (from Step 7)
export async function logSystemAction(action: string, entityTable: string, entityId: string, details?: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const headersList = headers()
  const ip = headersList.get('x-forwarded-for') || 'Unknown'

  await supabase.from('audit_logs').insert({
    actor_id: user?.id,
    action,
    entity_table: entityTable,
    entity_id: entityId,
    new_data: details,
    ip_address: ip
  } as any)
}
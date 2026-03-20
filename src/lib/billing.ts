// src/lib/billing.ts
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails'

export async function handleFailedCharge(memberId: string, userEmail: string, poolName: string) {
  const supabase = createClient()
  
  // The Master Key: (supabase.from(...) as any) bypasses the strict schema check
  await (supabase.from('pool_members') as any)
    .update({ status: 'past_due' })
    .eq('id', memberId)

  await (supabase.from('audit_logs') as any).insert({
    action: 'SYSTEM_CHARGE_FAILED',
    entity_table: 'pool_members',
    entity_id: memberId,
    new_data: { status: 'past_due' }
  })

  await sendEmail({
    to: userEmail,
    subject: `Payment Failed - Action Required for ${poolName}`,
    template: 'PAYMENT_FAILED',
    data: { poolName }
  })
}
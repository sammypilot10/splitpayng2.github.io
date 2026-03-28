// src/lib/billing.ts
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/emails'

// Use service role client to bypass RLS — this runs from cron jobs with no user session
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function handleFailedCharge(memberId: string, userEmail: string, poolName: string) {
  await supabaseAdmin
    .from('pool_members')
    .update({ status: 'past_due' } as any)
    .eq('id', memberId)

  await (supabaseAdmin.from('audit_logs') as any).insert({
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
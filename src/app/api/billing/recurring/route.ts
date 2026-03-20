// src/app/api/billing/recurring/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { handleFailedCharge } from '@/lib/billing'
import { chargeAuthorization } from '@/lib/paystack'

// Use service role for cron jobs to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  // 1. Secure the endpoint (Only our Cron service can call this)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Find all active members whose next billing date is today or earlier
  const { data: dueMembers } = await supabase
    .from('pool_members')
    .select('*, pools(service_name, price_per_seat), profiles(email)')
    .eq('status', 'active')
    .lte('next_billing_date', new Date().toISOString())

  if (!dueMembers || dueMembers.length === 0) {
    return NextResponse.json({ message: 'No subscriptions due today.' })
  }

  const results = []

  // 3. Process idempotently
  for (const member of dueMembers) {
    try {
      // Call Paystack to charge the saved auth token
      const chargeResult = await chargeAuthorization(
        member.profiles.email,
        member.pools.price_per_seat,
        member.paystack_auth_code
      )

      if (chargeResult.status === 'success') {
        // Update next billing date (+30 days)
        const nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + 30)
        
        await supabase
          .from('pool_members')
          .update({ next_billing_date: nextDate.toISOString() })
          .eq('id', member.id)

        results.push({ id: member.id, status: 'success' })
      } else {
        await handleFailedCharge(member.id, member.profiles.email, member.pools.service_name)
        results.push({ id: member.id, status: 'failed' })
      }
    } catch (error) {
      await handleFailedCharge(member.id, member.profiles.email, member.pools.service_name)
      results.push({ id: member.id, status: 'error' })
    }
  }

  return NextResponse.json({ processed: results.length, results })
}
// src/app/api/billing/recurring/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { handleFailedCharge } from '@/lib/billing'
import { chargeAuthorization } from '@/lib/paystack'
import { sendEmail } from '@/lib/emails'

// Use service role for cron jobs to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  // 1. Secure the endpoint (Only our Cron service can call this)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Find all active and past_due members whose next billing date is today or earlier
  // Also only select those where retry_count < 3
  const { data: dueMembers } = await supabase
    .from('pool_members')
    .select('*, pools(service_name, price_per_seat), profiles(email)')
    .in('status', ['active', 'past_due'])
    .lt('retry_count', 3)
    .lte('next_billing_date', new Date().toISOString())

  if (!dueMembers || dueMembers.length === 0) {
    return NextResponse.json({ message: 'No subscriptions due today.' })
  }

  const results = []

  // 3. Process idempotently
  for (const member of dueMembers) {
    try {
      const memberEmail = Array.isArray(member.profiles) ? member.profiles[0]?.email : (member.profiles as any)?.email;
      const serviceName = Array.isArray(member.pools) ? member.pools[0]?.service_name : (member.pools as any)?.service_name;
      const pricePerSeat = Array.isArray(member.pools) ? member.pools[0]?.price_per_seat : (member.pools as any)?.price_per_seat;

      if (!memberEmail) {
        console.error(`[CRON] Member ${member.id} has no valid email. Skipping.`);
        continue;
      }

      // Call Paystack to charge the saved auth token
      const chargeResult = await chargeAuthorization(
        memberEmail,
        pricePerSeat,
        member.paystack_auth_code
      )

      if (chargeResult.status && chargeResult.data?.status === 'success') {
        // Update next billing date (+30 days), reset retry count and status
        const nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + 30)
        
        await supabase
          .from('pool_members')
          .update({ 
            next_billing_date: nextDate.toISOString(),
            status: 'active',
            retry_count: 0
          })
          .eq('id', member.id)

        results.push({ id: member.id, status: 'success' })
      } else {
        const nextRetryCount = (member.retry_count || 0) + 1
        const nextStatus = nextRetryCount >= 3 ? 'cancelled' : 'past_due'
        
        // Add 24 hours to next_billing_date for the next retry interval
        const retryDate = new Date()
        retryDate.setDate(retryDate.getDate() + 1)

        await supabase
          .from('pool_members')
          .update({
             retry_count: nextRetryCount,
             status: nextStatus,
             next_billing_date: nextStatus === 'cancelled' ? member.next_billing_date : retryDate.toISOString()
          })
          .eq('id', member.id)

        // 🔥 HOST EVICTION NOTIFICATION & CAPACITY UPDATE 🔥
        if (nextStatus === 'cancelled') {
           // FREE UP THE SEAT
           const { data: poolData } = await supabase.from('pools').select('id, host_id, current_seats, is_public').eq('id', member.pool_id).single()
           
           if (poolData && poolData.current_seats > 0) {
              await supabase.from('pools').update({ current_seats: poolData.current_seats - 1 }).eq('id', member.pool_id)
           }

           if (poolData?.host_id) {
              const { data: hostProfile } = await supabase.from('profiles').select('email').eq('id', poolData.host_id).single()
              
              const serviceName = Array.isArray(member.pools) ? member.pools[0]?.service_name : (member.pools as any)?.service_name;
              const memberEmail = Array.isArray(member.profiles) ? member.profiles[0]?.email : (member.profiles as any)?.email;

              if (hostProfile?.email && serviceName && memberEmail) {
                  console.log(`[CRON] Member ${memberEmail} kicked out. Emailing Host ${hostProfile.email} to evict them.`)
                  await sendEmail({
                     to: hostProfile.email,
                     subject: `Action Required: Evict Member from ${serviceName}`,
                     template: 'HOST_MEMBER_EVICTED',
                     data: { poolName: serviceName, memberEmail }
                  })
              }
           }
        }

        const memberEmail = Array.isArray(member.profiles) ? member.profiles[0]?.email : (member.profiles as any)?.email;
        const serviceName = Array.isArray(member.pools) ? member.pools[0]?.service_name : (member.pools as any)?.service_name;
        
        await handleFailedCharge(member.id, memberEmail, serviceName)
        results.push({ id: member.id, status: 'failed', retry_count: nextRetryCount })
      }
    } catch (error) {
      const memberEmail = Array.isArray(member.profiles) ? member.profiles[0]?.email : (member.profiles as any)?.email;
      const serviceName = Array.isArray(member.pools) ? member.pools[0]?.service_name : (member.pools as any)?.service_name;

      await handleFailedCharge(member.id, memberEmail, serviceName)
      results.push({ id: member.id, status: 'error' })
    }
  }

  return NextResponse.json({ processed: results.length, results })
}
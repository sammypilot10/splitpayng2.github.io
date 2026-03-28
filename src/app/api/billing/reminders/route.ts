// src/app/api/billing/reminders/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

  // Calculate the 3-day window
  // We want to find subscriptions that renew exactly 3 days from today.
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);

  const startOfDay = new Date(targetDate.setHours(0,0,0,0)).toISOString();
  const endOfDay = new Date(targetDate.setHours(23,59,59,999)).toISOString();

  // Fetch active subscriptions renewing in the 3-day window
  const { data: upcomingMembers, error } = await supabase
    .from('pool_members')
    .select('id, next_billing_date, pools(service_name, price_per_seat), profiles(email)')
    .eq('status', 'active')
    .gte('next_billing_date', startOfDay)
    .lte('next_billing_date', endOfDay)

  if (error || !upcomingMembers || upcomingMembers.length === 0) {
    return NextResponse.json({ message: 'No subscriptions due for a 3-day reminder today.', error })
  }

  const results = []

  for (const member of upcomingMembers) {
    try {
      const email = Array.isArray(member.profiles) ? member.profiles[0]?.email : (member.profiles as any)?.email;
      const serviceName = Array.isArray(member.pools) ? member.pools[0]?.service_name : (member.pools as any)?.service_name;
      const pricePerSeat = Array.isArray(member.pools) ? member.pools[0]?.price_per_seat : (member.pools as any)?.price_per_seat;

      if (email && serviceName) {
        console.log(`[CRON] Sending 3-Day Reminder to ${email} for ${serviceName}`)
        
        await sendEmail({
          to: email,
          subject: `Action Required: Upcoming Charge for ${serviceName}`,
          template: 'UPCOMING_RENEWAL',
          data: { 
            poolName: serviceName,
            billingDate: new Date(member.next_billing_date).toLocaleDateString(),
            amount: pricePerSeat
          }
        })
        results.push({ id: member.id, status: 'reminder_sent' })
      }
    } catch (err) {
      console.error(`[CRON] Failed to send reminder to ${member.id}:`, err)
      results.push({ id: member.id, status: 'error' })
    }
  }

  return NextResponse.json({ processed: results.length, results })
}

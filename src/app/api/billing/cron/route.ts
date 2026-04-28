// src/app/api/billing/cron/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/emails'

// Use service role for cron jobs to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  // 1. Secure the endpoint — only Vercel Cron can call this
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Calculate the date exactly 3 days from now
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    const startOfDay = new Date(threeDaysFromNow)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(threeDaysFromNow)
    endOfDay.setHours(23, 59, 59, 999)

    // 3. Query pool_members whose next_billing_date falls on that day
    const { data: dueMembers, error } = await supabase
      .from('pool_members')
      .select('*, pools(service_name, price_per_seat), profiles(email)')
      .eq('status', 'active')
      .gte('next_billing_date', startOfDay.toISOString())
      .lte('next_billing_date', endOfDay.toISOString())

    if (error) {
      console.error('[CRON] Query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!dueMembers || dueMembers.length === 0) {
      console.log('[CRON] No upcoming renewals in 3 days.')
      return NextResponse.json({ message: 'No upcoming renewals in 3 days.', notified: 0 })
    }

    // 4. Send reminder emails
    let notifiedCount = 0

    for (const member of dueMembers) {
      const memberEmail = (member as any).profiles?.email
      const poolName = (member as any).pools?.service_name
      const pricePerSeat = (member as any).pools?.price_per_seat
      const billingDateRaw = member.next_billing_date

      if (!memberEmail || !poolName) continue

      const billingDate = new Date(billingDateRaw).toLocaleDateString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      try {
        await sendEmail({
          to: memberEmail,
          subject: `Reminder: Your ${poolName} subscription renews in 3 days`,
          template: 'UPCOMING_RENEWAL',
          data: {
            poolName,
            billingDate,
            amount: pricePerSeat
          }
        })
        notifiedCount++
        console.log(`[CRON] ✅ Sent renewal reminder for pool ${poolName}`)
      } catch (emailErr) {
        console.error(`[CRON] ❌ Failed to send reminder to ${memberEmail}:`, emailErr)
      }
    }

    return NextResponse.json({
      message: `Renewal reminders sent successfully.`,
      notified: notifiedCount,
      total: dueMembers.length
    })
  } catch (err: any) {
    console.error('[CRON] Unexpected error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

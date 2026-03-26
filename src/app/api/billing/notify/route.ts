// src/app/api/billing/notify/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cron endpoint: Send renewal reminder emails 2 days before subscription_end_date
export async function POST(req: Request) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const { searchParams } = new URL(req.url)
    const cronSecret = searchParams.get('secret')
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find all active memberships expiring in 2 days that haven't been notified
    const twoDaysFromNow = new Date()
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
    const startOfDay = new Date(twoDaysFromNow)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(twoDaysFromNow)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: expiringMembers } = await supabase
      .from('pool_members')
      .select('*, pools(*)')
      .eq('status', 'active')
      .eq('renewal_notification_sent', false)
      .gte('subscription_end_date', startOfDay.toISOString())
      .lte('subscription_end_date', endOfDay.toISOString())

    if (!expiringMembers || expiringMembers.length === 0) {
      return NextResponse.json({ message: 'No notifications to send', count: 0 })
    }

    let notifiedCount = 0

    for (const member of expiringMembers) {
      // Get member's email and card info
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, card_last4, card_type')
        .eq('id', member.member_id)
        .single()

      if (!profile?.email) continue

      const pool = member.pools as any

      // Send renewal reminder email
      try {
        // Using a simple fetch to your email API or SendGrid/Resend
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/emails/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: profile.email,
            subject: `Renewal Reminder: ${pool?.service_name} subscription renews in 2 days`,
            html: `
              <h2>Subscription Renewal Reminder</h2>
              <p>Your <strong>${pool?.service_name}</strong> pool subscription will renew on <strong>${new Date(member.subscription_end_date).toLocaleDateString()}</strong>.</p>
              <p><strong>Amount:</strong> ₦${pool?.price_per_seat?.toLocaleString()}</p>
              <p><strong>Card on file:</strong> ${profile.card_type || 'Card'} ****${profile.card_last4 || '----'}</p>
              <p>If you'd like to update your card, <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/cards">click here</a>.</p>
            `
          })
        })

        // Mark as notified to prevent duplicates
        await supabase
          .from('pool_members')
          .update({ renewal_notification_sent: true })
          .eq('id', member.id)

        notifiedCount++
      } catch (emailErr) {
        console.error(`Failed to send notification to ${profile.email}:`, emailErr)
      }
    }

    return NextResponse.json({ message: 'Notifications sent', count: notifiedCount })
  } catch (error: any) {
    console.error('Billing notify error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

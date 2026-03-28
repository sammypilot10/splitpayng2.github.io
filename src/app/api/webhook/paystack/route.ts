// src/app/api/webhook/paystack/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { sendEmail } from '@/lib/emails'

type PoolMemberInsert = Database['public']['Tables']['pool_members']['Insert']

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature')

    // 1. HMAC Verification
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
                       .update(rawBody)
                       .digest('hex')

    if (hash !== signature) {
      console.error("🔴 WEBHOOK SIGNATURE MISMATCH")
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    // Use admin client for webhook processing to bypass RLS
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 2. Process Successful Charge
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data

      // Idempotency check
      const { data } = await supabase.from('transactions').select('status').eq('reference', reference).single()
      
      if (data?.status === 'success') return NextResponse.json({ status: 'already processed' })

      // Mark TX as success
      await supabase.from('transactions').update({ status: 'success' }).eq('reference', reference)

      // Create Pool Membership & Start 48h Escrow
      const escrowExpiresAt = new Date()
      escrowExpiresAt.setHours(escrowExpiresAt.getHours() + 48)

      const memberPayload: PoolMemberInsert = {
        pool_id: metadata.pool_id,
        member_id: metadata.user_id,
        escrow_status: 'pending',
        escrow_expires_at: escrowExpiresAt.toISOString()
      }

      await supabase.from('pool_members').insert(memberPayload as never)

      // Increment Pool Seat Count
      await (supabase.rpc as any)('increment_pool_seats', { row_id: metadata.pool_id })
    }

    // 🔥 3. Process Failed Charge — Handle card declines gracefully
    if (event.event === 'charge.failed') {
      const { metadata, customer } = event.data
      const memberEmail = customer?.email

      console.log(`[WEBHOOK] charge.failed received for user: ${memberEmail}`)

      if (metadata?.pool_id && metadata?.user_id) {
        // Find the pool member record
        const { data: member } = await supabase
          .from('pool_members')
          .select('id, pool_id')
          .eq('pool_id', metadata.pool_id)
          .eq('member_id', metadata.user_id)
          .eq('status', 'active')
          .single()

        if (member) {
          // 3a. Update member status to 'past_due'
          await supabase
            .from('pool_members')
            .update({ status: 'past_due' } as any)
            .eq('id', member.id)

          console.log(`[WEBHOOK] Member ${member.id} set to past_due`)

          // 3b. Fetch pool details to get service name and host_id
          const { data: pool } = await supabase
            .from('pools')
            .select('service_name, host_id, price_per_seat')
            .eq('id', member.pool_id)
            .single()

          const poolName = pool?.service_name || 'Unknown Pool'

          // 3c. Send PAYMENT_FAILED email to the Member
          if (memberEmail) {
            await sendEmail({
              to: memberEmail,
              subject: `Payment Failed — Action Required for ${poolName}`,
              template: 'PAYMENT_FAILED',
              data: { poolName }
            })
            console.log(`[WEBHOOK] ✅ Sent PAYMENT_FAILED email to member: ${memberEmail}`)
          }

          // 3d. Send PAYMENT_FAILED_HOST email to the Host
          if (pool?.host_id) {
            const { data: hostProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', pool.host_id)
              .single()

            if (hostProfile?.email) {
              await sendEmail({
                to: hostProfile.email,
                subject: `Member Payment Failed for your ${poolName} pool`,
                template: 'PAYMENT_FAILED_HOST',
                data: { poolName }
              })
              console.log(`[WEBHOOK] ✅ Sent PAYMENT_FAILED_HOST email to host: ${hostProfile.email}`)
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'success' })

  } catch (error: any) {
    console.error("🔴 WEBHOOK ERROR:", error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
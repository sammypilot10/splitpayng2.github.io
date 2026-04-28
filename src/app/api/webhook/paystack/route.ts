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

    // 1. HMAC Verification against Timing Attacks
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
                       .update(rawBody)
                       .digest('hex')

    // Node.js crypto.timingSafeEqual requires Buffers of the exact same length
    const signatureBuffer = Buffer.from(signature || '', 'hex');
    const hashBuffer = Buffer.from(hash, 'hex');

    if (signatureBuffer.length !== hashBuffer.length || !crypto.timingSafeEqual(signatureBuffer, hashBuffer)) {
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

        // Idempotency check with atomic locking
        const { data: isFirstSuccess } = await supabase.rpc('mark_transaction_successful', { p_reference: reference })
        
        if (!isFirstSuccess) {
           console.log(`[WEBHOOK] Transaction ${reference} was already successfully processed. Ignoring duplicate.`)
           return NextResponse.json({ status: 'already processed' })
        }

      // Create Pool Membership & Start 48h Escrow
      const escrowExpiresAt = new Date()
      escrowExpiresAt.setHours(escrowExpiresAt.getHours() + 48)

      const memberPayload: PoolMemberInsert = {
        pool_id: metadata.pool_id,
        member_id: metadata.user_id,
        escrow_status: 'pending',
        escrow_expires_at: escrowExpiresAt.toISOString(),
        paystack_auth_code: event.data?.authorization?.authorization_code || null
      }

      await supabase.from('pool_members').insert(memberPayload as never)

      console.log(`[WEBHOOK] 🎉 New membership created | pool: ${metadata.pool_id.substring(0, 8)}... | ts: ${Date.now()}`)
      
      // Optional: send admin Slack/email notification for the first week
      if (process.env.ADMIN_NOTIFICATION_EMAIL) {
        try {
          await sendEmail({
            to: process.env.ADMIN_NOTIFICATION_EMAIL,
            subject: '🎉 New SplitPayNG Member!',
            template: 'MEMBER_JOINED',
            data: { poolName: `Pool ${metadata.pool_id}` }
          })
        } catch (e) {
          // Non-fatal
        }
      }

      // Increment Pool Seat Count logic wrapped in Try/Catch to protect against our new CHECK constraint
      try {
        const { error: seatError } = await (supabase.rpc as any)('increment_pool_seats', { row_id: metadata.pool_id })
        
        if (seatError) {
          // If the postgres 'increment_pool_seats' function throws due to our `CHECK (current_seats <= max_seats)` constraint,
          // it means the pool filled up milliseconds before this transaction.
          // We MUST NOT leave them stranded, so we instantly refund!
          throw new Error(`Seat Increment Failed: ${seatError.message}`)
        }
      } catch (err: any) {
        console.error(`[WEBHOOK SEAT OVERFLOW DETECTED] Pool is full. Initiating Auto-Refund for Tx: ${reference}`, err.message)
        
        // 1. Mark TX as 'failed_refunded' instead of leaving it stranded
        await supabase.from('transactions').update({ status: 'failed_refunded' }).eq('reference', reference)
        
        // 2. Void membership record to stop access logic
        await supabase.from('pool_members').update({ status: 'cancelled' } as any)
          .eq('pool_id', metadata.pool_id)
          .eq('member_id', metadata.user_id)
          .eq('status', 'escrow')

        // 3. Initiate actual Paystack Refund Protocol
        const secretKey = process.env.PAYSTACK_SECRET_KEY
        if (secretKey) {
          await fetch('https://api.paystack.co/refund', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transaction: reference })
          }).catch(e => console.error("CRITICAL: Auto-Refund request to Paystack failed:", e))
        }

        return NextResponse.json({ status: 'refunded_due_to_capacity' })
      }
    }

    // 🔥 3. Process Failed Charge — Handle card declines gracefully
    if (event.event === 'charge.failed') {
      const { metadata, customer } = event.data
      const memberEmail = customer?.email

      console.log(`[WEBHOOK] charge.failed received | user_email: ${memberEmail?.substring(0, 3)}***@***.com`)

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
            console.log(`[WEBHOOK] ✅ Sent PAYMENT_FAILED email for pool: ${poolName}`)
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
              console.log(`[WEBHOOK] ✅ Sent PAYMENT_FAILED_HOST email to host for pool: ${poolName}`)
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
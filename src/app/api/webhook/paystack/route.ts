// src/app/api/webhook/paystack/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

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
    const supabase = createClient()

    // 2. Process Successful Charge
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data

      // Idempotency check (cast to any to bypass stale TS types for new table)
      const { data } = await (supabase.from as any)('transactions').select('status').eq('reference', reference).single()
      
      if (data?.status === 'success') return NextResponse.json({ status: 'already processed' })

      // Mark TX as success
      await (supabase.from as any)('transactions').update({ status: 'success' }).eq('reference', reference)

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

      // Increment Pool Seat Count (cast to any to bypass strict RPC typing)
      await (supabase.rpc as any)('increment_pool_seats', { row_id: metadata.pool_id })
    }

    return NextResponse.json({ status: 'success' })

  } catch (error: any) {
    console.error("🔴 WEBHOOK ERROR:", error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
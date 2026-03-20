// src/app/api/memberships/verify/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js' 
import { verifyTransaction } from '@/lib/paystack'

export async function POST(req: Request) {
  console.log("\n=============================================")
  console.log("🔍 FINAL VERIFICATION ATTEMPT...")
  try {
    const { reference } = await req.json()
    
    // 1. Verify with Paystack
    const paystackRes = await verifyTransaction(reference)
    if (!paystackRes.status || paystackRes.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    const { pool_id: poolId, user_id: userId } = paystackRes.data.metadata

    // 2. Admin Client (Master Key)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Check if already a member (Avoid Duplicate Key Error)
    const { data: existing } = await supabaseAdmin
      .from('pool_members')
      .select('id')
      .eq('pool_id', poolId)
      .eq('member_id', userId)
      .single()

    if (!existing) {
        const now = new Date().toISOString()
        const nextDate = new Date(); nextDate.setDate(nextDate.getDate() + 30)
        const escrowExpires = new Date(); escrowExpires.setHours(escrowExpires.getHours() + 48)

        console.log("💾 SAVING MEMBERSHIP...")
        const { error: mErr } = await supabaseAdmin.from('pool_members').insert({
            pool_id: poolId,
            member_id: userId,
            status: 'escrow',
            escrow_status: 'pending', // Verified magic word
            escrow_expires_at: escrowExpires.toISOString(), 
            next_billing_date: nextDate.toISOString(),
            joined_at: now
        })
        if (mErr) throw new Error(`Pool Member Insert Failed: ${mErr.message}`)

        console.log("💾 SAVING TRANSACTION LOG...")
        const { error: tErr } = await supabaseAdmin.from('transactions').insert({
            pool_id: poolId,
            user_id: userId,
            amount: paystackRes.data.amount / 100, 
            status: 'success', // Verified magic word from your screenshot
            reference: reference,
            created_at: now
        })
        if (tErr) console.log("⚠️ Transaction log failed (Non-fatal):", tErr.message)
        
        console.log("✅ ALL SYSTEMS GO! USER ADDED.")
    } else {
        console.log("ℹ️ USER IS ALREADY A MEMBER.")
    }

    console.log("=============================================\n")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.log("❌ VERIFICATION CRASHED:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
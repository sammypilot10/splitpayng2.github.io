// src/app/api/cron/escrow-release/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  // CRON Authentication: Ensure only Vercel can trigger this
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log("🕒 CRON JOB STARTED: Auto-Escrow Release Sweep")

    // Use Service Role to bypass RLS and perform admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Find all members stuck in 'pending' escrow where their 48 hours has expired
    const { data: expiredEscrows, error: fetchError } = await supabaseAdmin
      .from('pool_members')
      .select('id, pool_id, member_id')
      .eq('escrow_status', 'pending')
      .lte('escrow_expires_at', new Date().toISOString())
      .limit(100); // 🔒 Ensure we don't drop rows with the 1,000 Supabase cull by restricting the working set

    if (fetchError) throw fetchError

    if (!expiredEscrows || expiredEscrows.length === 0) {
      console.log("✅ CRON FINISHED: No expired escrows found.")
      return NextResponse.json({ status: 'success', released: 0 })
    }

    let releasedCount = 0

    // 2. Process concurrently in small batches to respect Serverless boundaries
    const BATCH_SIZE = 10;
    for (let i = 0; i < expiredEscrows.length; i += BATCH_SIZE) {
      const batch = expiredEscrows.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (membership) => {
        console.log(`[ESCROW SWEEP] Processing Membership: ${membership.id}`)

        // A) Fetch the pool to verify price and get the host_id
        const { data: poolData } = await supabaseAdmin
          .from('pools')
          .select('host_id, price_per_seat')
          .eq('id', membership.pool_id)
          .single()

        if (!poolData) return

        const amountToHost = poolData.price_per_seat * 0.80 // 80% to Host, 20% to Platform

        // B) Update the membership explicitly to 'confirmed'
        // Double check for concurrency using status match!
        const { error: updateError } = await supabaseAdmin
          .from('pool_members')
          .update({ escrow_status: 'confirmed' } as any)
          .eq('id', membership.id)
          .eq('escrow_status', 'pending') 

        if (updateError) {
          console.error(`[ESCROW SWEEP] Failed to update status for ${membership.id}`, updateError)
          return
        }

        // C) Call our atomic RPC to safely credit the host's wallet!
        const { error: balanceError } = await (supabaseAdmin.rpc as any)('adjust_profile_balance', {
          p_user_id: poolData.host_id,
          p_amount: amountToHost
        })

        if (balanceError) {
          console.error(`CRITICAL: Escrow status confirmed but Host payout failed for ${poolData.host_id}. Fix manually!`)
        } else {
          releasedCount++
          console.log(`[ESCROW SWEEP] Successfully released ₦${amountToHost} to Host ${poolData.host_id}`)
        }
      }));
    }

    console.log(`✅ CRON FINISHED: Automatically released ${releasedCount} escrows!`)
    return NextResponse.json({ status: 'success', released: releasedCount })

  } catch (err: any) {
    console.error("🔴 CRON SERVER ERROR:", err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

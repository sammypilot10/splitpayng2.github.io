// src/app/api/memberships/action/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/emails' // 🔥 Now using your awesome template file

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { memberId, action } = await req.json()

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify this member belongs to this user
    const { data: member } = await supabaseAdmin
      .from('pool_members')
      .select('*, pools(service_name, host_id, price_per_seat, profiles(email))')
      .eq('id', memberId)
      .eq('member_id', user.id)
      .single()

    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (action === 'confirm') {
      if (member.escrow_status !== 'confirmed') {
        const { error } = await supabaseAdmin.from('pool_members').update({ escrow_status: 'confirmed', status: 'active' } as any).eq('id', memberId)
        
        if (!error) {
          console.log(`[LEDGER] Escrow confirmed for Member ID: ${memberId}. Commencing funds release.`);
          
          // UNBREAKABLE STRICT POOL QUERY - avoid Supabase join array ambiguity
          const { data: exactPool, error: poolError } = await supabaseAdmin.from('pools').select('host_id, price_per_seat').eq('id', member.pool_id).single()
          
          if (exactPool && exactPool.host_id && exactPool.price_per_seat) {
            const hostId = exactPool.host_id;
            const price = exactPool.price_per_seat;
            
            // 🔥 PLATFORM FEE: Deduct exactly 20%, Host receives 80%
            const PLATFORM_FEE_PERCENT = 0.20;
            const platformFee = Math.round(price * PLATFORM_FEE_PERCENT);
            const hostPayout = price - platformFee;
            
            console.log(`[LEDGER] Price: ₦${price} | Platform Fee (20%): ₦${platformFee} | Host Payout (80%): ₦${hostPayout}`);
            console.log(`[LEDGER] Adding ₦${hostPayout} to Host ${hostId} available balance...`);
            
            const { data: hostProfile } = await supabaseAdmin.from('profiles').select('balance').eq('id', hostId).single();
            const newBalance = (hostProfile?.balance || 0) + hostPayout;
            
            const { error: walletError } = await supabaseAdmin.from('profiles').update({ balance: newBalance }).eq('id', hostId);
            
            if (walletError) {
              console.error("[CRITICAL] Failed to credit wallet!", walletError);
            } else {
              console.log(`[LEDGER] SUCCESS! Host wallet updated to: ₦${newBalance} (after 20% platform fee)`);
            }
          } else {
            console.error(`[CRITICAL] Failed to resolve exact pool config. PoolID: ${member.pool_id}. Error:`, poolError);
          }
        }
      }
    } 
    else if (action === 'dispute') {
      await supabaseAdmin.from('pool_members').update({ escrow_status: 'disputed' } as any).eq('id', memberId)

      // 🔥 AUTOMATION: Trigger the DISPUTE_RAISED template!
      const hostEmail = member.pools?.profiles?.email;
      const serviceName = member.pools?.service_name;

      if (hostEmail) {
        await sendEmail({
          to: hostEmail, // NOTE: In Resend test mode, this only works if hostEmail is your own email!
          subject: `Action Required: Dispute on your ${serviceName} pool`,
          template: 'DISPUTE_RAISED',
          data: { poolName: serviceName }
        });
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
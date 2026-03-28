// src/app/api/admin/disputes/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { refundTransaction } from '@/lib/paystack'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const profile = data as { role: string } | null
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: disputes, error } = await supabaseAdmin
      .from('pool_members')
      .select(`
        id,
        escrow_status,
        joined_at,
        profiles ( email ),
        pools ( service_name, price_per_seat, host_id )
      `)
      .in('escrow_status', ['disputed', 'refunded'])
      .order('joined_at', { ascending: false })

    if (error) throw error

    const enrichedDisputes = await Promise.all((disputes || []).map(async (d: any) => {
        if (d.pools?.host_id) {
            const { data: host } = await supabaseAdmin.from('profiles').select('whatsapp_number').eq('id', d.pools.host_id).single()
            return { ...d, host_whatsapp: host?.whatsapp_number }
        }
        return d
    }))

    return NextResponse.json({ disputes: enrichedDisputes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const adminProfile = data as { role: string } | null
    if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { memberId, action } = await req.json()

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Fetch all the details we need for the email
    const { data: member } = await supabaseAdmin.from('pool_members').select('*').eq('id', memberId).single()
    if (!member) throw new Error("Member not found")
    
    const { data: memberProfile } = await supabaseAdmin.from('profiles').select('email').eq('id', member.member_id).single()
    const { data: pool } = await supabaseAdmin.from('pools').select('*').eq('id', member.pool_id).single()
    const { data: hostProfile } = await supabaseAdmin.from('profiles').select('email').eq('id', pool?.host_id).single()

    const memberEmail = memberProfile?.email
    const hostEmail = hostProfile?.email
    const serviceName = pool?.service_name

    let memberSubject = ""
    let memberMessage = ""
    let hostSubject = ""
    let hostMessage = ""

    // 2. Database Updates & Email Content Prep
    if (action === 'refund') {
      // 🔥 FIX: Find the original transaction reference to refund
      const { data: tx } = await supabaseAdmin
        .from('transactions')
        .select('reference')
        .eq('pool_id', member.pool_id)
        .eq('user_id', member.member_id)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (tx?.reference) {
        console.log(`[ADMIN] Calling Paystack Refund API for Reference: ${tx.reference}`)
        const refundRes = await refundTransaction(tx.reference)
        if (!refundRes.status) {
          throw new Error(`Paystack Refund Failed: ${refundRes.message}`)
        }
        console.log(`[ADMIN] Paystack Refund Successful!`)
      } else {
        console.error(`[CRITICAL] No original transaction found to refund for Member ${memberId}`)
        throw new Error("Could not find original transaction reference to refund.")
      }

      // Update DB
      await supabaseAdmin.from('pool_members').update({ escrow_status: 'refunded', status: 'closed' } as any).eq('id', memberId)
      if (pool && pool.current_seats > 0) {
        await supabaseAdmin.from('pools').update({ current_seats: pool.current_seats - 1 }).eq('id', member.pool_id)
      }

      // Email Content
      memberSubject = `Dispute Resolved: Refund Processed for ${serviceName}`
      memberMessage = `Hello, your dispute for ${serviceName} has been reviewed and approved. A full refund has been issued.`
      hostSubject = `Action Required: Dispute Lost for ${serviceName}`
      hostMessage = `Hello, a member reported invalid credentials for your ${serviceName} pool. The dispute was approved and they were refunded. Please update your pool credentials immediately.`
    } 
    else if (action === 'reject') {
      // Update DB
      await supabaseAdmin.from('pool_members').update({ escrow_status: 'confirmed', status: 'active' } as any).eq('id', memberId)

      // 🔥 FIX: Credit the Host's balance with 80% (20% platform fee)
      // This is needed because the member disputed instead of confirming,
      // so the confirm-access flow never ran and the host was never paid.
      if (pool && pool.host_id && pool.price_per_seat) {
        const PLATFORM_FEE_PERCENT = 0.20;
        const platformFee = Math.round(pool.price_per_seat * PLATFORM_FEE_PERCENT);
        const hostPayout = pool.price_per_seat - platformFee;

        const { data: hostBalance } = await supabaseAdmin.from('profiles').select('balance').eq('id', pool.host_id).single();
        const newBalance = (hostBalance?.balance || 0) + hostPayout;
        await supabaseAdmin.from('profiles').update({ balance: newBalance }).eq('id', pool.host_id);
        
        console.log(`[ADMIN] Dispute rejected. Credited Host ${pool.host_id} with ₦${hostPayout} (80% of ₦${pool.price_per_seat}). New balance: ₦${newBalance}`);
      }

      // Email Content
      memberSubject = `Dispute Update: Claim Rejected for ${serviceName}`
      memberMessage = `Hello, we reviewed your dispute for ${serviceName}. The host has proven the credentials work, so your refund request was rejected and the escrow has been released to the host.`
      hostSubject = `Dispute Won: Escrow Released for ${serviceName}`
      hostMessage = `Hello, a dispute on your ${serviceName} pool was rejected. The funds have been released from escrow to your available balance.`
    }

    // 3. Send the Emails using Resend!
    if (process.env.RESEND_API_KEY) {
      // Send to Member
      if (memberEmail) {
        await resend.emails.send({
          from: 'SplitPayNG <onboarding@resend.dev>', // Change to your verified domain later!
          to: memberEmail,
          subject: memberSubject,
          text: memberMessage
        })
      }
      
      // Send to Host
      if (hostEmail) {
        await resend.emails.send({
          from: 'SplitPayNG <onboarding@resend.dev>', // Change to your verified domain later!
          to: hostEmail,
          subject: hostSubject,
          text: hostMessage
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Dispute processing error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
// src/app/api/admin/disputes/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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
        pools ( service_name, price_per_seat )
      `)
      .in('escrow_status', ['disputed', 'refunded'])
      .order('joined_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ disputes: disputes || [] })
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
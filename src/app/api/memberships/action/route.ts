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
      .select('*, pools(service_name, profiles(email))')
      .eq('id', memberId)
      .eq('member_id', user.id)
      .single()

    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (action === 'confirm') {
      await supabaseAdmin.from('pool_members').update({ escrow_status: 'confirmed', status: 'active' } as any).eq('id', memberId)
    } 
    else if (action === 'dispute') {
      await supabaseAdmin.from('pool_members').update({ escrow_status: 'disputed' } as any).eq('id', memberId)

      // 🔥 AUTOMATION: Trigger the DISPUTE_RAISED template!
      const hostEmail = member.pools?.profiles?.email;
      const serviceName = member.pools?.service_name;

      if (hostEmail) {
        await sendEmail({
          to: hostEmail, // NOTE: In Resend test mode, this only works if hostEmail is your own email!
          subject: `🚨 Action Required: Dispute on your ${serviceName} pool`,
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
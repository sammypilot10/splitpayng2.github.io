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
          const hostId = member.pools?.host_id;
          const price = member.pools?.price_per_seat || 0;
          
          if (hostId && price > 0) {
            const { data: hostProfile } = await supabaseAdmin.from('profiles').select('balance').eq('id', hostId).single();
            const newBalance = (hostProfile?.balance || 0) + price;
            await supabaseAdmin.from('profiles').update({ balance: newBalance }).eq('id', hostId);
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
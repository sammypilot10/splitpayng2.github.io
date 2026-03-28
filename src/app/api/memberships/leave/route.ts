// src/app/api/memberships/leave/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { memberId } = await req.json()

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify this member belongs to this user
    const { data: member } = await supabaseAdmin
      .from('pool_members')
      .select('pool_id, member_id')
      .eq('id', memberId)
      .eq('member_id', user.id)
      .single()

    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // 1. Delete the member
    await supabaseAdmin.from('pool_members').delete().eq('id', memberId)

    // 2. Decrement seats
    const { data: poolData } = await supabaseAdmin.from('pools').select('current_seats').eq('id', member.pool_id).single()
    if (poolData && poolData.current_seats > 0) {
      await supabaseAdmin.from('pools').update({ current_seats: poolData.current_seats - 1 }).eq('id', member.pool_id)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

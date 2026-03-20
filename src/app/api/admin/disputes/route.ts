// src/app/api/admin/disputes/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
    const profile = data as { role: string } | null
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // We now accept an 'action' parameter to know which button you clicked
    const { memberId, action } = await req.json()

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'refund') {
      const { data: member } = await supabaseAdmin.from('pool_members').select('pool_id').eq('id', memberId).single()
      
      await supabaseAdmin.from('pool_members').update({ escrow_status: 'refunded', status: 'closed' } as any).eq('id', memberId)

      if (member?.pool_id) {
        const { data: pool } = await supabaseAdmin.from('pools').select('current_seats').eq('id', member.pool_id).single()
        if (pool && pool.current_seats > 0) {
          await supabaseAdmin.from('pools').update({ current_seats: pool.current_seats - 1 }).eq('id', member.pool_id)
        }
      }
    } 
    else if (action === 'reject') {
      // 🔥 If the member lied, we mark them as active and confirmed!
      await supabaseAdmin.from('pool_members').update({ escrow_status: 'confirmed', status: 'active' } as any).eq('id', memberId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
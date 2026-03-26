// src/app/api/pools/invite/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { poolId } = await req.json()

    // Verify host owns this pool
    const { data: poolRaw } = await (supabase.from('pools') as any).select('host_id').eq('id', poolId).single()
    const pool = poolRaw as any
    if (!pool || pool.host_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized. You do not own this pool.' }, { status: 403 })
    }

    // Generate new token
    const newToken = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('')

    await (supabase.from('pools') as any)
      .update({ invite_token: newToken })
      .eq('id', poolId)

    return NextResponse.json({ invite_token: newToken })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

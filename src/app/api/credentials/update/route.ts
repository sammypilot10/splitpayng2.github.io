// src/app/api/credentials/update/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { poolId, encryptedData, iv } = await req.json()

    // 1. SECURITY CHECK: Ensure this user actually owns this pool!
    const { data: pool } = await supabase
      .from('pools')
      .select('id')
      .eq('id', poolId)
      .eq('host_id', user.id)
      .single()

    if (!pool) return NextResponse.json({ error: 'Forbidden. You do not own this pool.' }, { status: 403 })

    // 2. ACTIVATE GOD MODE
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Check if credentials row already exists
    const { data: existingCreds } = await supabaseAdmin
      .from('pool_credentials')
      .select('pool_id')
      .eq('pool_id', poolId)

    // 4. Update if it exists, Insert if it is brand new
    if (existingCreds && existingCreds.length > 0) {
        // 🔥 THE FIX: Removed the 'updated_at' property completely so the database doesn't panic
        const { error } = await (supabaseAdmin.from('pool_credentials') as any)
          .update({ encrypted_data: encryptedData, iv: iv })
          .eq('pool_id', poolId)
        if (error) throw error
    } else {
        const { error } = await (supabaseAdmin.from('pool_credentials') as any)
          .insert({ pool_id: poolId, encrypted_data: encryptedData, iv: iv })
        if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Credentials Update Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
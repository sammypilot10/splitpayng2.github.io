// src/app/api/credentials/decrypt/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// Import the matching decryption function from your crypto library
import { decryptData } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // 1. Verify the user is actually logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { encryptedData, poolId } = await req.json()
    if (!encryptedData || !poolId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // 2. SECURITY CHECK: Ensure the user actually belongs to this pool!
    const { data: membership, error: memberError } = await supabase
      .from('pool_members')
      .select('id, status')
      .eq('pool_id', poolId)
      .eq('member_id', user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: 'You do not have access to this vault.' }, { status: 403 })
    }

    // 3. Get the Initialization Vector (IV) from the database needed for decryption
    const { data, error: credError } = await supabase
      .from('pool_credentials')
      .select('iv')
      .eq('pool_id', poolId)
      .eq('encrypted_data', encryptedData)
      .single()

    // 🔥 THE FIX: Explicitly cast the data to silence TypeScript
    const credData = data as { iv: string } | null

    if (credError || !credData || !credData.iv) {
      return NextResponse.json({ error: 'Failed to retrieve decryption key' }, { status: 500 })
    }

    // 4. Decrypt the password!
    const decryptedJsonString = await decryptData(encryptedData, credData.iv)
    
    return NextResponse.json({ decryptedData: decryptedJsonString })
    
  } catch (error: any) {
    console.error("Decryption Error:", error)
    return NextResponse.json({ error: 'Failed to decrypt credentials' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptData } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify the user is authenticated (Only logged in hosts can encrypt)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Already has auth check, but add request size limit
    const { rawData } = await req.json()
    if (!rawData || typeof rawData !== 'string' || rawData.length > 10000) {
      return NextResponse.json({ error: 'Invalid or oversized data.' }, { status: 400 })
    }

    // Encrypt securely on the server
    const { encryptedData, iv } = await encryptData(rawData)
    
    return NextResponse.json({ encryptedData, iv })
    
  } catch (error: any) {
    console.error("Encryption Error:", error)
    return NextResponse.json({ error: 'Failed to encrypt credentials securely on the server' }, { status: 500 })
  }
}

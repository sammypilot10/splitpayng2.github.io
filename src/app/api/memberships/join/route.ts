// src/app/api/memberships/join/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  console.log("\n=============================================")
  console.log("🚀 INITIATING PAYSTACK CHECKOUT FLOW...")
  
  try {
    // 1. Check Supabase Auth
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) console.log("⚠️ SUPABASE AUTH ERROR:", authError.message)
    console.log("👤 USER DETECTED:", user ? "authenticated" : "NONE (API thinks you are logged out!)")

    if (!user) {
      console.log("❌ FAIL: User is not authenticated. Returning 401.")
      console.log("=============================================\n")
      return NextResponse.json({ error: 'Unauthorized user. Please log in.' }, { status: 401 })
    }

    // 2. Parse Request Body
    const body = await req.json()
    const { poolId, amount } = body
    console.log("📦 PAYLOAD RECEIVED: Pool ID:", poolId ? poolId.substring(0, 8) + '...' : 'missing')

    // Validate amount matches the pool's actual price (prevent client-side manipulation)
    if (!poolId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid request parameters.' }, { status: 400 })
    }

    // 3. 🔥 HOST SELF-JOIN PREVENTION + POOL VALIDATION
    const { data: poolRaw } = await supabase.from('pools').select('*').eq('id', poolId).single()
    const poolData = poolRaw as any
    
    if (!poolData) {
      return NextResponse.json({ error: 'Pool not found.' }, { status: 404 })
    }

    // Strict amount verification - never trust client-sent amount
    if (Math.abs(amount - poolData.price_per_seat) > 1) { // Allow ₦1 rounding tolerance
      console.error(`[SECURITY] Amount mismatch! Client sent ₦${amount}, pool price is ₦${poolData.price_per_seat}`)
      return NextResponse.json({ error: 'Payment amount mismatch. Please refresh the page.' }, { status: 400 })
    }

    // Use the database amount for Paystack, NOT the client-provided amount
    const verifiedAmount = poolData.price_per_seat

    if (poolData.host_id === user.id) {
      console.log("❌ FAIL: Host attempted to join their own pool.")
      return NextResponse.json({ error: 'Pool creators cannot join their own pool.' }, { status: 400 })
    }

    if (poolData.status !== 'active') {
      return NextResponse.json({ error: 'This pool is no longer accepting members.' }, { status: 400 })
    }

    if (poolData.current_seats >= poolData.max_seats) {
      return NextResponse.json({ error: 'This pool is full. No seats available.' }, { status: 400 })
    }

    // 4. 🔥 MANDATORY CARD GUARD: Check if member has a saved payment card
    const { data: memberProfile } = await (supabase.from('profiles') as any)
      .select('card_token, card_verified')
      .eq('id', user.id)
      .single()

    if (!memberProfile?.card_token || !memberProfile?.card_verified) {
      return NextResponse.json({ 
        error: 'You must add a valid payment card before joining a pool.',
        redirect: '/dashboard/cards'
      }, { status: 403 })
    }

    // 5. Check Paystack Environment Variables
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    if (!secretKey) {
      console.log("❌ FAIL: Missing Paystack key in .env.local")
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // 4. Contact Paystack directly (Most reliable method)
    console.log("🌐 CONTACTING PAYSTACK API...")
    
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(verifiedAmount * 100), // Convert to Kobo using DB value
        callback_url: `${siteUrl}/dashboard/subscriptions`,
        metadata: {
          pool_id: poolId,
          user_id: user.id,
          action: 'join_pool'
        }
      })
    })

    const data = await paystackRes.json()
    console.log("📥 PAYSTACK RESPONSE:", JSON.stringify(data).substring(0, 150) + "...")

    // 5. Handle Paystack rejection
    if (!data.status) {
      console.log("❌ FAIL: Paystack rejected the request. Reason:", data.message)
      console.log("=============================================\n")
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    console.log("✅ SUCCESS: Checkout URL generated!")
    console.log("=============================================\n")
    
    return NextResponse.json({ 
      authorization_url: data.data.authorization_url,
      reference: data.data.reference 
    })

  } catch (error: any) {
    console.log("❌ FATAL SERVER ERROR:", error.message)
    console.log("=============================================\n")
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
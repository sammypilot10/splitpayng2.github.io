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
    console.log("👤 USER DETECTED:", user ? user.email : "NONE (API thinks you are logged out!)")

    if (!user) {
      console.log("❌ FAIL: User is not authenticated. Returning 401.")
      console.log("=============================================\n")
      return NextResponse.json({ error: 'Unauthorized user. Please log in.' }, { status: 401 })
    }

    // 2. Parse Request Body
    const body = await req.json()
    const { poolId, amount } = body
    console.log("📦 PAYLOAD RECEIVED: Pool ID:", poolId, "| Amount: ₦", amount)

    // 3. Check Paystack Environment Variables
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
        amount: Math.round(amount * 100), // Convert to Kobo
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
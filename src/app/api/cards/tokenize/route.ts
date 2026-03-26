// src/app/api/cards/tokenize/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// POST: Initialize Paystack charge for card tokenization (₦50 verification)
export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (!secretKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Initialize ₦50 verification charge with Paystack
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        amount: 5000, // ₦50 in kobo
        callback_url: `${siteUrl}/dashboard/cards`,
        channels: ['card'],
        metadata: {
          user_id: user.id,
          action: 'card_tokenization'
        }
      })
    })

    const data = await paystackRes.json()

    if (!data.status) {
      return NextResponse.json({ error: data.message || 'Paystack initialization failed' }, { status: 400 })
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference
    })
  } catch (error: any) {
    console.error('Card tokenization init error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Verify the charge and save the card token
export async function PUT(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { reference } = await req.json()

    // Verify with Paystack
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` }
    })

    const verifyData = await verifyRes.json()

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.json({ error: 'Card verification failed. Please try again.' }, { status: 400 })
    }

    const authorization = verifyData.data.authorization
    if (!authorization || !authorization.authorization_code) {
      return NextResponse.json({ error: 'No card authorization received.' }, { status: 400 })
    }

    // Save card token to profile (using admin client to bypass RLS)
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabaseAdmin.from('profiles').update({
      card_token: authorization.authorization_code,
      card_last4: authorization.last4,
      card_type: authorization.card_type || authorization.brand,
      card_verified: true
    }).eq('id', user.id)

    // Refund the ₦50 verification charge
    try {
      await fetch('https://api.paystack.co/refund', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transaction: reference })
      })
    } catch (refundErr) {
      console.error('Verification charge refund failed (non-fatal):', refundErr)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Card verification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

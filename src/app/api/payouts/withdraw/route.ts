// src/app/api/payouts/withdraw/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    // 1. Verify the user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Read the user's cleared balance from their profile
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const withdrawAmount = profile.balance || 0

    if (withdrawAmount < 30000) {
      return NextResponse.json({ error: 'Minimum withdrawal amount is ₦30,000' }, { status: 400 })
    }

    // 3. Verify bank details are linked
    if (!profile.account_number || !profile.bank_code) {
      return NextResponse.json({ error: 'Bank details not found. Please link your account first.' }, { status: 400 })
    }

    // 🔥 THE DEVELOPER BYPASS: If using the test zeros, mock a successful transfer
    if (profile.account_number === '0000000000') {
      // Simulate network delay to show the loading spinner
      await new Promise(resolve => setTimeout(resolve, 1500)) 

      // Deduct balance even in test mode
      await (supabase.rpc('adjust_profile_balance', { p_user_id: user.id, p_amount_delta: -withdrawAmount } as any) as any)
      
      // 🔥 FIX: Log the fake test withdrawal directly into the 'payouts' table
      const mockRef = `mock_test_ref_${Date.now()}`
      await (supabase.from('payouts') as any)
        .insert({
          user_id: user.id,
          amount: withdrawAmount,
          status: 'completed',
          reference: mockRef
        })

      return NextResponse.json({ 
        success: true, 
        message: 'TEST TRANSFER SUCCESSFUL!',
        reference: mockRef,
        amount: withdrawAmount
      })
    }

    // ==========================================
    // REAL PAYSTACK TRANSFER ENGINE
    // ==========================================

    // Step A: Create the Transfer Recipient
    const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: "nuban",
        name: profile.account_name,
        account_number: profile.account_number,
        bank_code: profile.bank_code,
        currency: "NGN"
      })
    })

    const recipientData = await recipientRes.json()
    if (!recipientData.status) {
      throw new Error(recipientData.message || "Failed to create transfer recipient")
    }

    const recipientCode = recipientData.data.recipient_code

    // Step B: Initiate the Transfer (Amount must be in kobo, so multiply by 100)
    const transferRes = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: "balance",
        amount: withdrawAmount * 100, // Naira to Kobo
        recipient: recipientCode,
        reason: "SplitPayNG Earnings Withdrawal"
      })
    })

    const transferData = await transferRes.json()
    if (!transferData.status) {
      throw new Error(transferData.message || "Failed to initiate transfer")
    }

    // Step C: Deduct balance from profile after successful transfer initiation
    await (supabase.rpc('adjust_profile_balance', { p_user_id: user.id, p_amount_delta: -withdrawAmount } as any) as any)

    // 🔥 FIX: Log the live Paystack withdrawal directly into the 'payouts' table
    await (supabase.from('payouts') as any)
      .insert({
        user_id: user.id,
        amount: withdrawAmount,
        status: 'pending', // Paystack handles asynchronous clearing, but 'pending' shows in History
        reference: transferData.data.reference
      })

    return NextResponse.json({ 
      success: true, 
      message: 'Transfer initiated successfully!',
      reference: transferData.data.reference,
      amount: withdrawAmount
    })

  } catch (error: any) {
    console.error("Withdrawal Error:", error)
    return NextResponse.json({ error: error.message || 'Server error during withdrawal' }, { status: 500 })
  }
}
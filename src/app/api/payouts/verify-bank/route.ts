// src/app/api/payouts/verify-bank/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const accountNumber = searchParams.get('account_number')
  const bankCode = searchParams.get('bank_code')

  if (!accountNumber || !bankCode) {
    return NextResponse.json({ error: 'Missing account number or bank code' }, { status: 400 })
  }

  // 🔥 THE DEVELOPER BYPASS: Catch test account numbers so Paystack doesn't block you
  if (accountNumber === '0000000000') {
    return NextResponse.json({ account_name: "SplitPayNG Test Account" })
  }

  try {
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (data.status) {
      return NextResponse.json({ account_name: data.data.account_name })
    } else {
      return NextResponse.json({ error: data.message || 'Could not verify account' }, { status: 400 })
    }
  } catch (error) {
    console.error("Paystack Verification Error:", error)
    return NextResponse.json({ error: 'Server error during verification' }, { status: 500 })
  }
}
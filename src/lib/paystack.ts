// src/lib/paystack.ts

// 1. Initialize a payment when a member joins a pool
export async function initializeTransaction(payload: any) {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return response.json()
}

// 2. Verify the payment was successful
export async function verifyTransaction(reference: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  })
  return response.json()
}

// 3. Auto-charge a member's card for the next month
export async function chargeAuthorization(email: string, amount: number, authCode: string) {
  const response = await fetch('https://api.paystack.co/transaction/charge_authorization', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, amount: amount * 100, authorization_code: authCode }),
  })
  return response.json()
}

// 4. Send the 80% payout to the Host's bank account
export async function initiateHostPayout(hostBankCode: string, hostAccountNumber: string, amount: number) {
  const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: "nuban",
      name: "Host Payout",
      account_number: hostAccountNumber,
      bank_code: hostBankCode,
      currency: "NGN"
    }),
  })
  const recipientData = await recipientRes.json()

  const payoutAmount = amount * 0.8 * 100 // Platform takes 20%, Host gets 80%

  const transferRes = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: "balance",
      amount: payoutAmount,
      recipient: recipientData.data.recipient_code,
      reason: "SplitPayNG Pool Payout"
    }),
  })
  return transferRes.json()
}

// 🔥 NEW: Physically refund a user's card when an Admin approves a dispute
export async function refundTransaction(transactionReference: string) {
  const response = await fetch('https://api.paystack.co/refund', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      transaction: transactionReference 
      // Note: Not passing 'amount' automatically refunds the full original amount
    }),
  })
  return response.json()
}

// 🔥 NEW: Verify a Host's bank account number matches their name
export async function resolveAccountNumber(accountNumber: string, bankCode: string) {
  const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  })
  return response.json()
}

// 🔥 NEW: Fetch the list of all active Nigerian Banks for the Host UI Dropdown
export async function getBanks() {
  const response = await fetch('https://api.paystack.co/bank?currency=NGN', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  })
  return response.json()
}
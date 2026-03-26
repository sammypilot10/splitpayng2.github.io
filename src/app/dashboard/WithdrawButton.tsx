// src/app/dashboard/WithdrawButton.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function WithdrawButton({ activeEarnings }: { activeEarnings: number }) {
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    setSuccessMessage('')

    try {
      const res = await fetch('/api/payouts/withdraw', {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to process withdrawal')

      // Use server-returned amount if available, fallback to prop
      const amount = data.amount || activeEarnings
      setSuccessMessage(`Success! ₦${amount.toLocaleString()} is on the way to your bank.`)

    } catch (err: any) {
      alert("🚨 Transfer Failed: " + err.message)
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (successMessage) {
    return (
      <div className="flex items-center gap-2 text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-xl w-full sm:w-auto">
        <CheckCircle2 size={18} /> {successMessage}
      </div>
    )
  }

  return (
    <Button 
      onClick={handleWithdraw}
      disabled={activeEarnings === 0 || isWithdrawing}
      className="w-full sm:w-auto bg-fintech-navy hover:bg-fintech-navy/90 text-white font-bold disabled:opacity-50"
    >
      {isWithdrawing ? (
        <><Loader2 className="animate-spin mr-2" size={18} /> Processing Transfer...</>
      ) : activeEarnings === 0 ? (
        "No Funds Available"
      ) : (
        "Withdraw Funds Now"
      )}
    </Button>
  )
}
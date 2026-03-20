// src/app/retry-payment/[membershipId]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { Button } from '@/components/ui/Button'
import { AlertCircle, CreditCard } from 'lucide-react'

export default function RetryPaymentPage() {
  const { membershipId } = useParams()

  const handleRetry = async () => {
    alert("In production, this initializes a new Paystack transaction for the failed billing cycle.")
    // Logic: Call API -> Generate new reference -> Redirect to Paystack
  }

  return (
    <div className="min-h-screen bg-fintech-slate flex flex-col">
      <AppNavbar userRole="member" />
      <main className="flex-grow py-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <AlertCircle size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-fintech-navy mb-2">Payment Failed</h1>
          <p className="text-gray-500 mb-8 text-sm">
            We couldn't process your monthly renewal. Please update your payment method to maintain access to this pool.
          </p>
          
          <Button onClick={handleRetry} className="w-full py-5 text-lg bg-fintech-navy flex items-center justify-center gap-2">
            <CreditCard size={20} /> Use New Card
          </Button>
        </div>
      </main>
    </div>
  )
}
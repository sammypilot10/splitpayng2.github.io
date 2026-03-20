// src/app/payment/callback/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

// 1. We move the actual logic into an inner component
function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get('reference')
  const supabase = createClient()
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')

  useEffect(() => {
    if (!reference) {
      setStatus('failed')
      return
    }

    const channel = supabase
      .channel(`tx-${reference}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'transactions', filter: `reference=eq.${reference}` },
        (payload) => {
          if (payload.new.status === 'success') {
            setStatus('success')
            setTimeout(() => router.push('/subscriptions'), 2000)
          } else if (payload.new.status === 'failed') {
            setStatus('failed')
          }
        }
      )
      .subscribe()

    const fallbackCheck = setTimeout(async () => {
      const { data } = await supabase.from('transactions').select('status').eq('reference', reference).single()
      
      // Explicitly cast the returned row to silence the 'never' error
      const tx = data as { status: string } | null
      
      if (tx?.status === 'success') {
        setStatus('success')
        setTimeout(() => router.push('/dashboard/subscriptions'), 2000)
      } else if (tx?.status === 'failed') {
        setStatus('failed')
      }
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(fallbackCheck)
    }
  }, [reference, router, supabase])

  return (
    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-sm w-full text-center flex flex-col items-center">
      {status === 'verifying' && (
        <>
          <Loader2 className="animate-spin text-fintech-gold mb-6" size={48} />
          <h2 className="text-xl font-bold text-fintech-navy mb-2">Verifying Payment</h2>
          <p className="text-sm text-gray-500">Securing your escrow vault. Please do not close this page.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle2 className="text-teal-500 mb-6" size={48} />
          <h2 className="text-xl font-bold text-fintech-navy mb-2">Payment Successful!</h2>
          <p className="text-sm text-gray-500">Redirecting to your subscriptions...</p>
        </>
      )}
      {status === 'failed' && (
        <>
          <XCircle className="text-red-500 mb-6" size={48} />
          <h2 className="text-xl font-bold text-fintech-navy mb-2">Payment Failed</h2>
          <p className="text-sm text-gray-500 mb-6">We couldn't process this transaction.</p>
          <button onClick={() => router.push('/')} className="text-fintech-gold font-bold text-sm">Return Home</button>
        </>
      )}
    </div>
  )
}

// 2. We wrap that inner component in Suspense in the main exported page
export default function PaymentCallbackPage() {
  return (
    <div className="min-h-screen bg-fintech-slate flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-sm w-full text-center flex flex-col items-center">
          <Loader2 className="animate-spin text-fintech-gold mb-6" size={48} />
          <h2 className="text-xl font-bold text-fintech-navy mb-2">Loading...</h2>
        </div>
      }>
        <PaymentCallbackContent />
      </Suspense>
    </div>
  )
}
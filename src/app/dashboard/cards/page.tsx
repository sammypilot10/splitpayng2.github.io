// src/app/dashboard/cards/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { Button } from '@/components/ui/Button'
import { CreditCard, ShieldCheck, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function CardManagementPage() {
  const [loading, setLoading] = useState(true)
  const [cardInfo, setCardInfo] = useState<any>(null)
  const [isTokenizing, setIsTokenizing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchCardInfo()
  }, [])

  const fetchCardInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { data } = await (supabase.from('profiles') as any)
      .select('card_token, card_last4, card_type, card_verified')
      .eq('id', user.id)
      .single()

    setCardInfo(data)
    setLoading(false)
  }

  const handleAddCard = async () => {
    setIsTokenizing(true)
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please log in first.')

      // Initialize Paystack popup for card tokenization
      const res = await fetch('/api/cards/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to initialize card verification')

      // Redirect to Paystack checkout for ₦50 verification charge
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        throw new Error('Payment gateway did not return a valid link.')
      }
    } catch (err: any) {
      setError(err.message)
      setIsTokenizing(false)
    }
  }

  // Check for callback reference
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reference = params.get('reference')
    
    if (reference) {
      const verifyCard = async () => {
        setIsTokenizing(true)
        try {
          const res = await fetch('/api/cards/tokenize', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference })
          })
          const data = await res.json()
          
          if (res.ok) {
            setSuccess('Card verified and saved successfully!')
            fetchCardInfo()
            // Clean URL
            window.history.replaceState({}, '', '/dashboard/cards')
          } else {
            setError(data.error || 'Card verification failed.')
          }
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsTokenizing(false)
        }
      }
      verifyCard()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin mb-4 text-fintech-gold" size={40} />
        <p className="font-medium text-white/50">Loading card details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05080F]">
      <AppNavbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Payment Card</h1>
          <p className="text-white/50 mt-2">Manage your saved payment card for automatic subscription renewals.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
            <div className="bg-fintech-gold/10 p-3 rounded-full">
              <CreditCard className="text-fintech-gold" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Saved Card</h2>
              <p className="text-sm text-white/50">Used for automatic pool renewals.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400">
              <CheckCircle2 size={20} />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}

          {cardInfo?.card_verified && cardInfo?.card_last4 ? (
            <div className="space-y-6">
              {/* Current Card Display */}
              <div className="bg-gradient-to-br from-fintech-navy to-[#0a1224] p-6 rounded-2xl border border-white/10">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-xs font-bold text-fintech-gold uppercase tracking-wider">
                    {cardInfo.card_type || 'Card'}
                  </span>
                  <ShieldCheck size={20} className="text-green-400" />
                </div>
                <div className="text-2xl font-mono text-white tracking-wider mb-4">
                  •••• •••• •••• {cardInfo.card_last4}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                  <CheckCircle2 size={12} /> Verified & Active
                </div>
              </div>

              {/* Replace Card */}
              <Button
                onClick={handleAddCard}
                disabled={isTokenizing}
                className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 py-4 font-bold flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> Replace Card
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard size={48} className="mx-auto text-white/20 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No card saved</h3>
              <p className="text-white/40 text-sm mb-6">Add a card to enable automatic subscription renewals and join pools.</p>
              <p className="text-xs text-white/30 mb-6 flex items-center justify-center gap-1.5">
                <ShieldCheck size={12} /> A ₦50 verification charge will be made and immediately reversed.
              </p>
              <Button
                onClick={handleAddCard}
                disabled={isTokenizing}
                className="bg-fintech-gold text-[#05080F] hover:bg-fintech-gold/90 font-bold py-4 px-8"
              >
                {isTokenizing ? (
                  <><Loader2 className="animate-spin mr-2" size={18} /> Verifying...</>
                ) : (
                  'Add Payment Card'
                )}
              </Button>
            </div>
          )}
        </div>

        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="w-full mt-4 text-white/50 hover:text-white hover:bg-white/5 py-4"
        >
          ← Back to Dashboard
        </Button>
      </main>
    </div>
  )
}

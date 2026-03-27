// src/app/pools/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { Button } from '@/components/ui/Button'
import { ShieldCheck, Lock, AlertCircle, Loader2, Users, Ban } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PoolDetailsPage() {
  const params = useParams()
  const id = params.id as string

  const supabase = createClient()
  const [pool, setPool] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      // Fetch pool + current user in parallel
      const [poolRes, userRes] = await Promise.all([
        supabase.from('pools').select('*').eq('id', id).single() as any,
        supabase.auth.getUser()
      ])

      if (poolRes.data) {
        setPool(poolRes.data)
        const user = userRes.data?.user
        if (user) {
          setCurrentUserId(user.id)
          setIsHost(poolRes.data.host_id === user.id)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  const isFull = pool ? pool.current_seats >= pool.max_seats : false
  const slotsRemaining = pool ? pool.max_seats - pool.current_seats : 0

  const handleJoin = async () => {
    setIsProcessing(true)
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (!user || error) {
        window.location.href = `/auth?message=Please log in to join this pool&returnTo=/pools/${pool.id}`
        return
      }

      const res = await fetch('/api/memberships/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: pool.id, amount: pool.price_per_seat })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        // Intercept backend guard redirects (e.g., Mandatory Card Tokenization)
        if (data.redirect) {
          alert(`Security Notice: ${data.error}`)
          window.location.href = data.redirect
          return
        }
        throw new Error(data.error || 'Checkout initialization failed.')
      }

      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        throw new Error('Payment gateway did not return a valid checkout link.')
      }

    } catch (err: any) {
      alert("Checkout failed: " + err.message)
      setIsProcessing(false)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-fintech-slate flex flex-col">
        <AppNavbar userRole="member" />
        <div className="flex-grow flex flex-col items-center justify-center font-medium text-fintech-navy">
          <Loader2 className="animate-spin text-fintech-gold mb-4" size={32} />
          Loading secure vault...
        </div>
      </div>
    )
  }

  // Not Found State
  if (!pool) {
    return (
      <div className="min-h-screen bg-fintech-slate flex flex-col">
        <AppNavbar userRole="member" />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <AlertCircle size={48} className="text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-fintech-navy mb-2">Pool Not Found</h1>
          <p className="text-gray-500 mb-6">This subscription pool does not exist or the link is invalid.</p>
          <Button onClick={() => window.location.href = '/browse'}>Return to Marketplace</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fintech-slate flex flex-col">
      <AppNavbar userRole="member" />
      <main className="flex-grow py-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-fintech-navy/5 rounded-2xl flex items-center justify-center text-fintech-navy">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-fintech-navy text-center mb-2">{pool.service_name}</h1>
          <p className="text-center text-gray-500 mb-8">Join this pool and get instant access.</p>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">Monthly Seat Price</span>
              <span className="text-xl font-bold text-fintech-navy">₦{pool.price_per_seat.toLocaleString()}</span>
            </div>

            {/* 🔥 Slot Counter */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                <Users size={14} /> Seats
              </span>
              <span className="text-sm font-bold text-fintech-navy">
                {pool.current_seats} / {pool.max_seats}
                <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                  isFull 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {isFull ? 'FULL' : `${slotsRemaining} left`}
                </span>
              </span>
            </div>

            <hr className="border-gray-200 mb-4" />
            <div className="flex items-start gap-3 text-xs text-green-700 bg-green-50 p-3 rounded-lg">
              <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" />
              <p>Payment secured by Paystack. We never see your card details. Funds are held in escrow for 48 hours.</p>
            </div>
          </div>

          {/* 🔥 HOST SELF-JOIN GUARD + FULL POOL GUARD */}
          {isHost ? (
            <div className="w-full py-4 rounded-xl bg-gray-100 border border-gray-200 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 font-bold text-sm">
                <Ban size={16} /> You created this pool
              </div>
              <p className="text-xs text-gray-400 mt-1">Pool creators cannot join their own pool.</p>
            </div>
          ) : isFull ? (
            <button
              disabled
              className="w-full py-6 rounded-xl text-lg font-bold bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            >
              Pool Full — No Seats Available
            </button>
          ) : (
            <Button 
              onClick={handleJoin} 
              disabled={isProcessing}
              className="w-full py-6 text-lg bg-fintech-navy hover:bg-fintech-navy/90 text-white shadow-xl flex justify-center items-center font-bold transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin mr-2" size={20} /> Securing Seat...</>
              ) : (
                `Pay ₦${pool.price_per_seat.toLocaleString()} to Join`
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
// src/app/dashboard/subscriptions/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { Button } from '@/components/ui/Button'
import { Clock, ShieldCheck, ShieldAlert, Key, Lock, Loader2, AlertTriangle, Eye, EyeOff, Copy, Check } from 'lucide-react'

function SubscriptionsContent() {
  const [memberships, setMemberships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  
  const [decryptedCreds, setDecryptedCreds] = useState<Record<string, { username?: string, password?: string }>>({})
  const [decryptingIds, setDecryptingIds] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const verifyAndFetch = async () => {
      const reference = searchParams.get('reference')
      
      if (reference) {
        setVerifying(true)
        try {
          const res = await fetch('/api/memberships/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference })
          })
          if (res.ok) {
            window.location.href = '/dashboard/subscriptions'
            return
          }
        } catch (e) {
          console.error("Verification failed", e)
        }
        setVerifying(false)
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('pool_members')
        .select(`
          *,
          pools ( 
            *, 
            pool_credentials ( * )
          )
        `)
        .eq('member_id', user.id)

      if (error) console.error("Supabase Fetch Error:", error)
      if (data) setMemberships(data)
      
      setLoading(false)
    } 

    verifyAndFetch()
  }, [searchParams, router]) 

  const handleDecryptCredentials = async (memberId: string, poolId: string, encryptedData: string) => {
    if (decryptedCreds[memberId]) {
      const newCreds = { ...decryptedCreds }
      delete newCreds[memberId]
      setDecryptedCreds(newCreds)
      return
    }

    if (!encryptedData || encryptedData === "No credentials attached by host yet.") {
      alert("No secure credentials have been attached to this pool yet.");
      return;
    }

    setDecryptingIds(prev => ({ ...prev, [memberId]: true }))

    try {
      const res = await fetch('/api/credentials/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, encryptedData })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to decrypt')

      const parsedCreds = JSON.parse(data.decryptedData)
      setDecryptedCreds(prev => ({ ...prev, [memberId]: parsedCreds }))
    } catch (err: any) {
      alert(`Error unlocking vault: ${err.message}`)
    } finally {
      setDecryptingIds(prev => ({ ...prev, [memberId]: false }))
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleConfirmAccess = async (memberId: string) => {
    setIsProcessingAction(memberId)
    try {
      const res = await fetch('/api/memberships/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, action: 'confirm' })
      })

      if (!res.ok) throw new Error('Failed to confirm access')

      alert("Access Confirmed! Welcome to the pool.")
      setMemberships(memberships.map(m => 
        m.id === memberId ? { ...m, status: 'active', escrow_status: 'confirmed' } : m
      ))
    } catch (err: any) {
      alert("Error confirming access: " + err.message)
    } finally {
      setIsProcessingAction(null)
    }
  }

  const handleDispute = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to raise a dispute? Your access will be suspended while an Admin investigates.")) return;
    
    setIsProcessingAction(memberId)
    try {
      const res = await fetch('/api/memberships/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, action: 'dispute' })
      })

      if (!res.ok) throw new Error('Failed to raise dispute')

      alert("Dispute raised successfully. An admin will review this shortly.")
      setMemberships(memberships.map(m => 
        m.id === memberId ? { ...m, escrow_status: 'disputed' } : m
      ))
    } catch (err: any) {
      alert("Error raising dispute: " + err.message)
    } finally {
      setIsProcessingAction(null)
    }
  }

  if (loading || verifying) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-fintech-navy">
        <Loader2 className="animate-spin mb-4 text-fintech-gold" size={40} />
        <p className="font-medium">{verifying ? "Verifying your secure payment..." : "Opening your vault..."}</p>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-fintech-navy tracking-tight">My Subscriptions</h1>
        <p className="text-gray-500 mt-2">Manage your active memberships and view your secure credentials.</p>
      </div>

      {memberships.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <Lock size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-fintech-navy mb-2">Your vault is empty</h3>
          <p className="text-gray-500 mb-6">You haven't joined any subscription pools yet.</p>
          <Button onClick={() => router.push('/')} className="bg-fintech-navy">Browse Pools</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {memberships.map((sub) => {
            const rawEncryptedData = sub.pools?.pool_credentials?.[0]?.encrypted_data || sub.pools?.pool_credentials?.encrypted_data || "";
            const isDecrypting = decryptingIds[sub.id];
            const unlockedCreds = decryptedCreds[sub.id];
            const isProcessing = isProcessingAction === sub.id;

            return (
              <div key={sub.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-fintech-navy">{sub.pools?.service_name || 'Service'}</h3>
                    <p className="text-sm font-medium text-gray-500">₦{sub.pools?.price_per_seat?.toLocaleString() || '0'} / month</p>
                  </div>
                  
                  {/* 🔥 UPDATED BADGES: Handles Refunded, Disputed, Escrow, and Active */}
                  {sub.escrow_status === 'refunded' ? (
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Lock size={12} /> REFUNDED
                    </span>
                  ) : sub.escrow_status === 'disputed' ? (
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldAlert size={12} /> DISPUTED
                    </span>
                  ) : sub.status === 'escrow' ? (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Clock size={12} /> IN ESCROW
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} /> ACTIVE
                    </span>
                  )}
                </div>

                <div className="bg-fintech-navy text-white p-5 rounded-2xl mb-6 flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-fintech-gold">
                      <Key size={16} />
                      <span className="text-sm font-bold tracking-wide uppercase italic">Secure Credentials</span>
                    </div>
                  </div>
                  
                  {/* 🔥 THE FIX: If they are refunded, lock them out of the vault entirely! */}
                  {sub.escrow_status === 'refunded' ? (
                    <div className="bg-gray-500/10 border border-gray-500/20 p-6 rounded-xl text-center mt-2">
                      <Lock size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-300 font-medium">Access Revoked</p>
                      <p className="text-xs text-gray-400 mt-1">This subscription was refunded. You no longer have access to this vault.</p>
                    </div>
                  ) : sub.status === 'escrow' && sub.escrow_status !== 'disputed' ? (
                    <div className="space-y-4">
                      <p className="text-xs text-gray-300">
                        Please view the credentials and test them on the service provider's website. If they work, confirm access below.
                      </p>
                      
                      {unlockedCreds ? (
                        <div className="space-y-3">
                          <div className="p-4 bg-white/10 rounded-xl border border-fintech-gold/30">
                            <div className="mb-3">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Login Email / Username</p>
                              <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                                <span className="font-mono text-sm">{unlockedCreds.username || 'N/A'}</span>
                                <button onClick={() => handleCopy(unlockedCreds.username || '', `user-${sub.id}`)} className="text-gray-400 hover:text-fintech-gold">
                                  {copiedId === `user-${sub.id}` ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Password</p>
                              <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                                <span className="font-mono text-sm">{unlockedCreds.password || 'N/A'}</span>
                                <button onClick={() => handleCopy(unlockedCreds.password || '', `pass-${sub.id}`)} className="text-gray-400 hover:text-fintech-gold">
                                  {copiedId === `pass-${sub.id}` ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDecryptCredentials(sub.id, sub.pools.id, rawEncryptedData)}
                            className="text-xs text-fintech-gold hover:text-white flex items-center justify-center gap-1 transition-colors w-full py-2 cursor-pointer relative z-50 pointer-events-auto"
                          >
                            <EyeOff size={14} /> Hide Credentials
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleDecryptCredentials(sub.id, sub.pools.id, rawEncryptedData)}
                          disabled={isDecrypting}
                          className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer relative z-50 pointer-events-auto disabled:opacity-50"
                        >
                          {isDecrypting ? <Loader2 className="animate-spin" size={16} /> : <Eye size={16} />} 
                          {isDecrypting ? 'Unlocking Vault...' : 'View Credentials to Test'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sub.escrow_status === 'disputed' && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-xs text-red-200 mb-4">
                          This subscription is currently under dispute review by an Admin. Access is temporarily suspended.
                        </div>
                      )}

                      {unlockedCreds ? (
                        <div className="space-y-3">
                          <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                            <div className="mb-3">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Login Email / Username</p>
                              <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                                <span className="font-mono text-sm">{unlockedCreds.username || 'N/A'}</span>
                                <button onClick={() => handleCopy(unlockedCreds.username || '', `user-${sub.id}`)} className="text-gray-400 hover:text-white">
                                  {copiedId === `user-${sub.id}` ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Password</p>
                              <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                                <span className="font-mono text-sm">{unlockedCreds.password || 'N/A'}</span>
                                <button onClick={() => handleCopy(unlockedCreds.password || '', `pass-${sub.id}`)} className="text-gray-400 hover:text-white">
                                  {copiedId === `pass-${sub.id}` ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDecryptCredentials(sub.id, sub.pools.id, rawEncryptedData)}
                            className="text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1 transition-colors w-full py-2 cursor-pointer relative z-50 pointer-events-auto"
                          >
                            <EyeOff size={14} /> Hide Credentials
                          </button>
                        </div>
                      ) : (
                         <button 
                          onClick={() => handleDecryptCredentials(sub.id, sub.pools.id, rawEncryptedData)}
                          disabled={isDecrypting || sub.escrow_status === 'disputed'}
                          className="w-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white flex items-center justify-center gap-2 py-3 rounded-lg text-sm transition-colors cursor-pointer relative z-50 pointer-events-auto disabled:opacity-50"
                        >
                          {isDecrypting ? <Loader2 className="animate-spin" size={16} /> : <Key size={16} />} 
                          {isDecrypting ? 'Unlocking...' : 'Reveal Credentials'}
                        </button>
                      )}
                      
                      <p className="text-[10px] text-gray-400 pt-2 border-t border-white/10">Next billing: {sub.next_billing_date ? sub.next_billing_date.split('T')[0] : 'N/A'}</p>
                    </div>
                  )}
                </div>

                {sub.status === 'escrow' && sub.escrow_status !== 'disputed' && sub.escrow_status !== 'refunded' && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <p className="text-xs text-center text-gray-500 font-medium">Do the credentials work?</p>
                    <Button 
                      onClick={() => handleConfirmAccess(sub.id)} 
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-5 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Yes, Confirm Access'}
                    </Button>
                    <button 
                      onClick={() => handleDispute(sub.id)}
                      disabled={isProcessing}
                      className="w-full text-xs text-red-500 hover:text-red-700 font-medium flex items-center justify-center gap-1 mt-2 disabled:opacity-50"
                    >
                      <AlertTriangle size={12} /> No, Report Issue (Dispute)
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-fintech-slate">
      <AppNavbar userRole="member" />
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-fintech-gold" size={40}/></div>}>
        <SubscriptionsContent />
      </Suspense>
    </div>
  )
}
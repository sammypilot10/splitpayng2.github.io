// src/app/dashboard/subscriptions/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { Button } from '@/components/ui/Button'
import { Clock, ShieldCheck, ShieldAlert, Key, Lock, Loader2, AlertTriangle, Eye, EyeOff, Copy, Check, MessageCircle } from 'lucide-react'
import { BrandLogo } from '@/components/pools/BrandLogo'

const ADMIN_WHATSAPP = '2348117060606'


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

      alert("Dispute raised successfully. You will now be redirected to WhatsApp to provide your proof to the Admin.")
      
      const text = encodeURIComponent("Hello Admin, I am raising a dispute for my pool seat.")
      window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${text}`, "_blank")

      setMemberships(memberships.map(m => 
        m.id === memberId ? { ...m, escrow_status: 'disputed' } : m
      ))
    } catch (err: any) {
      alert("Error raising dispute: " + err.message)
    } finally {
      setIsProcessingAction(null)
    }
  }

  const handleLeavePool = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to leave this pool? You will lose access to the credentials permanently, and this action cannot be undone.")) return;
    
    setIsProcessingAction(memberId)
    try {
      const res = await fetch('/api/memberships/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      })

      if (!res.ok) throw new Error('Failed to leave pool')

      alert("You have successfully left the pool.")
      setMemberships(memberships.filter(m => m.id !== memberId))
    } catch (err: any) {
      alert("Error leaving pool: " + err.message)
    } finally {
      setIsProcessingAction(null)
    }
  }

  if (loading || verifying) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-white/50">
        <Loader2 className="animate-spin mb-4 text-fintech-gold" size={40} />
        <p className="font-medium">{verifying ? "Verifying your secure payment..." : "Opening your vault..."}</p>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">My Subscriptions</h1>
        <p className="text-white/50 mt-2">Manage your active memberships and view your secure credentials.</p>
      </div>

      {memberships.length === 0 ? (
        <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10">
          <Lock size={48} className="mx-auto text-white/30 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Your vault is empty</h3>
          <p className="text-white/50 mb-6">You haven't joined any subscription pools yet.</p>
          <Button onClick={() => router.push('/browse')} className="bg-fintech-gold text-[#05080F] font-bold hover:bg-fintech-gold/90">Browse Pools</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {memberships.map((sub) => {
            const rawEncryptedData = sub.pools?.pool_credentials?.[0]?.encrypted_data || sub.pools?.pool_credentials?.encrypted_data || "";
            const isDecrypting = decryptingIds[sub.id];
            const unlockedCreds = decryptedCreds[sub.id];
            const isProcessing = isProcessingAction === sub.id;


            return (
              <div key={sub.id} className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col hover:border-white/20 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="h-12 w-auto min-w-[3rem] px-2 py-2 bg-white/10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner shrink-0 leading-none">
                      <BrandLogo name={sub.pools?.service_name || 'Service'} size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                        {sub.pools?.service_name || 'Service'}
                        {sub.pools?.host_username && (
                          <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-md font-medium tracking-wide">
                            HOST: {sub.pools.host_username}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm font-medium text-fintech-gold">₦{sub.pools?.price_per_seat?.toLocaleString() || '0'} <span className="text-white/50">/ month</span></p>
                    </div>
                  </div>
                  
                  {/* 🔥 UPDATED BADGES: Handles Refunded, Disputed, Escrow, and Active */}
                  {sub.escrow_status === 'refunded' ? (
                    <span className="bg-white/10 text-white/50 border border-white/10 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Lock size={12} /> REFUNDED
                    </span>
                  ) : sub.escrow_status === 'disputed' ? (
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldAlert size={12} /> DISPUTED
                    </span>
                  ) : sub.status === 'escrow' ? (
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Clock size={12} /> IN ESCROW
                    </span>
                  ) : (
                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} /> ACTIVE
                    </span>
                  )}
                </div>

                <div className="bg-[#0a1224] border border-white/5 shadow-inner text-white p-5 rounded-2xl mb-6 flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-fintech-gold">
                      <Key size={16} />
                      <span className="text-sm font-bold tracking-wide uppercase italic">Secure Credentials</span>
                    </div>
                  </div>
                  
                  {/* 🔥 THE FIX: If they are refunded, cancelled, or past due, lock them out of the vault entirely! */}
                  {sub.escrow_status === 'refunded' || sub.status === 'cancelled' || sub.status === 'past_due' ? (
                    <div className="bg-gray-500/10 border border-gray-500/20 p-6 rounded-xl text-center mt-2">
                      <Lock size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-300 font-medium">Access Revoked</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {sub.status === 'past_due' 
                          ? 'Your subscription is past due. Please update your payment method to restore access.'
                          : sub.status === 'cancelled'
                            ? 'Your subscription has been cancelled. You no longer have access to this vault.'
                            : 'This subscription was refunded. You no longer have access to this vault.'}
                      </p>
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
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-xs text-red-200 mb-4 space-y-3">
                          <p>This subscription is currently under dispute review by an Admin. Access is temporarily suspended.</p>
                          <button
                            onClick={() => {
                              const text = encodeURIComponent(`Hello Admin, I am following up on my dispute for ${sub.pools?.service_name}. My membership ID is ${sub.id}.`)
                              window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${text}`, '_blank')
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors"
                          >
                            <MessageCircle size={14} /> Contact Admin on WhatsApp
                          </button>
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

                {/* 🔥 ESCROW PAYOUT CONFIRMATION BUTTONS */}
                {sub.status === 'escrow' && sub.escrow_status !== 'disputed' && sub.escrow_status !== 'refunded' && (
                  <div className="space-y-3 pt-4 border-t border-white/10 mt-2">
                    <p className="text-xs text-center text-white/50 font-medium">Do the credentials work?</p>
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

                {/* 🔥 ACTIVE PAYOUT CLAWBACK BUTTON */}
                {sub.status === 'active' && sub.escrow_status !== 'disputed' && sub.escrow_status !== 'refunded' && (
                  <div className="space-y-3 pt-4 border-t border-white/10 mt-2">
                    <button 
                      onClick={() => handleDispute(sub.id)}
                      disabled={isProcessing}
                      className="w-full text-xs text-red-500 hover:text-red-700 font-medium flex items-center justify-center gap-1 py-2 disabled:opacity-50"
                    >
                      <AlertTriangle size={14} className="mr-1" /> Password Stopped Working? Report Fraud
                    </button>
                  </div>
                )}
                
                {/* 🔥 Opt-Out Option */}
                {sub.status === 'active' && (
                  <div className="pt-4 border-t border-white/10 mt-2">
                    <button 
                      onClick={() => handleLeavePool(sub.id)}
                      disabled={isProcessing}
                      className="w-full text-xs text-fintech-slate/50 hover:text-red-500 font-medium flex items-center justify-center py-2 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={14} /> : 'Leave Pool (Opt-Out)'}
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
    <div className="min-h-screen bg-[#05080F]">
      <AppNavbar userRole="member" />
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-fintech-gold" size={40}/></div>}>
        <SubscriptionsContent />
      </Suspense>
    </div>
  )
}
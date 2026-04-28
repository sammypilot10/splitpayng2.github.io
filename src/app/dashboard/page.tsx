// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Wallet, Users, ArrowRight, Settings, PlusCircle, CreditCard, Key, Edit3, X, Loader2, Building2, CheckCircle2, Link2, Copy, RefreshCw, User, MessageCircle } from 'lucide-react'
import WithdrawButton from './WithdrawButton'
import { EscrowTimer } from '@/components/ui/EscrowTimer'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { Button } from '@/components/ui/Button'


export default function DashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  
  // Data States
  const [profile, setProfile] = useState<any>(null)
  const [myPools, setMyPools] = useState<any[]>([])
  const [myMemberships, setMyMemberships] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])

  // Edit Vault States
  const [updatingPoolId, setUpdatingPoolId] = useState<string | null>(null)
  const [updateForm, setUpdateForm] = useState({ username: '', password: '' })
  const [isEncrypting, setIsEncrypting] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth'
      return
    }

    // Fetch everything simultaneously for speed
    const [profileRes, poolsRes, membershipsRes, payoutsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('pools').select('*').eq('host_id', user.id).order('created_at', { ascending: false }),
      supabase.from('pool_members').select('*, pools(*)').eq('member_id', user.id).order('joined_at', { ascending: false }),
      supabase.from('payouts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    setProfile(profileRes.data as any)
    setMyPools(poolsRes.data || [])
    setMyMemberships(membershipsRes.data || [])
    setPayouts(payoutsRes.data || [])
    setLoading(false)
  }

  // Handle Vault Update Logic
  const handleUpdateCredentials = async (poolId: string) => {
    if (!poolId || !updateForm.username || !updateForm.password) {
      alert("Please fill both username and password.")
      return
    }
    
    setIsEncrypting(true)
    try {
      const payload = JSON.stringify(updateForm)

      // Step 1: Encrypt on server (crypto must NEVER run client-side)
      const encRes = await fetch('/api/credentials/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData: payload })
      })
      const encData = await encRes.json()
      if (!encRes.ok) throw new Error(encData.error || 'Encryption failed')

      // Step 2: Save to DB
      const saveRes = await fetch('/api/credentials/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, encryptedData: encData.encryptedData, iv: encData.iv })
      })
      const saveResult = await saveRes.json()
      if (!saveRes.ok) throw new Error(saveResult.error || 'Failed to save')

      alert("Vault credentials updated successfully. Existing members can access them immediately.")
      setUpdatingPoolId(null)
      setUpdateForm({ username: '', password: '' })
      fetchDashboardData()
    } catch (err: any) {
      alert("Failed to update vault: " + err.message)
    } finally {
      setIsEncrypting(false)
    }
  }

  const regenerateInviteLink = async (poolId: string) => {
    try {
      const res = await fetch('/api/pools/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId })
      })
      const data = await res.json()
      if (data.invite_token) {
        setMyPools(myPools.map(p => p.id === poolId ? { ...p, invite_token: data.invite_token } : p))
        alert('Invite link regenerated successfully!')
      } else {
        throw new Error(data.error || 'Failed to regenerate link')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const isHost = profile?.role === 'host' || profile?.role === 'admin'
  const isMember = profile?.role === 'member' || profile?.role === 'admin'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin mb-4 text-fintech-gold" size={40} />
        <p className="font-medium text-white/50">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05080F]">
      <AppNavbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-fintech-gold">{profile?.username || profile?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-white/50 mt-2">Manage your shared subscriptions and earnings securely.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: HOST ONLY OR SHARED? 
              - Wallet and Withdraw is for Host 
              - Subscriptions is for Member
          */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Balance Card (HOST ONLY) */}
            {isHost && (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-fintech-navy to-[#0a1224] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-fintech-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-fintech-gold font-medium mb-4">
                  <Wallet size={20} />
                  <span>Cleared Available Balance</span>
                </div>
                <div className="text-5xl font-black text-white mb-2 tracking-tight">
                  ₦{profile?.balance?.toLocaleString() || '0'}
                </div>
                <p className="text-sm text-white/50 mb-8">*Funds are added here 48 hours after a member pays.</p>
                
                <div className="flex gap-4">
                  <WithdrawButton activeEarnings={profile?.balance || 0} />
                  
                  <Link href="/create-pool">
                    <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors flex items-center gap-2">
                      <PlusCircle size={18} /> Host a Pool
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            )}

            {/* Withdrawal History */}
            {isHost && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="text-fintech-gold" /> Withdrawal History
                </h2>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {payouts && payouts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/70">
                      <thead className="bg-white/5 border-b border-white/10 text-white font-semibold">
                        <tr>
                          <th className="p-4">Date</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payouts.map((payout: any) => (
                          <tr key={payout.id} className="border-b border-white/5 last:border-0">
                            <td className="p-4">{new Date(payout.created_at).toLocaleDateString()}</td>
                            <td className="p-4 font-bold text-fintech-gold">₦{payout.amount.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                payout.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                payout.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              }`}>
                                {payout.status}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-xs opacity-50">{payout.reference.substring(0, 10)}...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-white/40">You haven't requested any withdrawals yet.</p>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* My Current Subscriptions (MEMBER ONLY) */}
            {isMember && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">My Current Subscriptions</h2>
                <Link href="/browse" className="text-sm font-medium text-fintech-gold hover:underline">
                  Browse Marketplace →
                </Link>
              </div>
              
              <div className="space-y-4">
                {myMemberships && myMemberships.length > 0 ? (
                  myMemberships.map((membership: any) => {
                    // Use the actual stored escrow expiry from database, not a recalculation
                    const expiresAtIso = membership.escrow_expires_at || 
                      new Date(new Date(membership.joined_at).getTime() + 48 * 60 * 60 * 1000).toISOString()

                    return (
                      <div key={membership.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-white/10 transition-colors">
                        <div>
                          <h3 className="font-bold text-white text-lg">{membership.pools.service_name}</h3>
                          <p className="text-sm text-fintech-slate/50">Joined {new Date(membership.joined_at).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {membership.escrow_status === 'pending' && (
                            <div className="text-right flex flex-col items-end">
                              <div className="text-[10px] text-fintech-gold uppercase tracking-wider font-bold mb-1">Escrow Timer</div>
                              <EscrowTimer expiresAt={expiresAtIso} />
                            </div>
                          )}
                          
                          <Link href={`/dashboard/subscriptions`}>
                            <button className="px-4 py-2 rounded-lg bg-fintech-gold text-[#05080F] font-bold text-sm hover:scale-105 transition-transform">
                              Manage
                            </button>
                          </Link>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/30 text-sm mb-4">You have no active subscriptions.</p>
                    <Link href="/browse">
                      <button className="px-6 py-2 rounded-xl bg-white/5 text-fintech-gold font-bold hover:bg-white/10 transition-colors">
                        Browse Marketplace
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* UPGRADE TO HOST BANNER (MEMBER ONLY) */}
            {!isHost && (
            <div className="p-6 mt-8 rounded-2xl bg-gradient-to-r from-fintech-navy/40 to-fintech-gold/10 border border-fintech-gold/20 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <User size={18} className="text-fintech-gold" /> Upgrade to Host
                </h3>
                <p className="text-sm text-white/50 mt-1">Want to start sharing your own subscriptions and earning real money?</p>
              </div>
              
              <a 
                href={`https://wa.me/2348117060606?text=${encodeURIComponent("Hello Admin, I am currently a Member on SplitPayNG and I would like to upgrade my account to become a Host. My email is: " + (profile?.email || ""))}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="px-6 py-2.5 rounded-xl bg-fintech-gold text-[#05080F] font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-fintech-gold/20">
                  <MessageCircle size={16} /> Message Admin on WhatsApp
                </button>
              </a>
            </div>
            )}
          </div>

          {/* RIGHT COLUMN (HOST ONLY) */}
          {isHost && (
          <div className="space-y-8">

            {/* 🔥 Host Profile Section */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="text-fintech-gold" size={18} /> Host Profile
                </h2>
                <Link href="/dashboard/settings">
                  <button className="text-xs text-fintech-gold hover:underline font-medium">Edit</button>
                </Link>
              </div>
              {profile?.username ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50">Username</span>
                    <span className="text-sm font-bold text-fintech-gold">@{profile.username}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50 flex items-center gap-1.5"><MessageCircle size={12} /> WhatsApp</span>
                    <span className="text-sm font-bold text-white font-mono">{profile.whatsapp_number || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full w-fit">
                    <CheckCircle2 size={12} /> Active
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-white/40 text-sm mb-3">No host profile set up yet.</p>
                  <Link href="/dashboard/settings">
                    <button className="px-4 py-2 rounded-lg bg-fintech-gold text-[#05080F] font-bold text-sm hover:scale-105 transition-transform">
                      Set Up Profile
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* 🔥 Payout Account Section */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="text-fintech-gold" size={18} /> Payout Account
                </h2>
                <Link href="/dashboard/settings">
                  <button className="text-xs text-fintech-gold hover:underline font-medium">Edit</button>
                </Link>
              </div>
              {profile?.account_number ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50">Bank</span>
                    <span className="text-sm font-bold text-white">{profile.bank_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50">Account</span>
                    <span className="text-sm font-bold text-white font-mono">****{profile.account_number?.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/50">Name</span>
                    <span className="text-sm font-bold text-white">{profile.account_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full w-fit">
                    <CheckCircle2 size={12} /> Verified
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-white/40 text-sm mb-3">No bank account linked yet.</p>
                  <Link href="/dashboard/settings">
                    <button className="px-4 py-2 rounded-lg bg-fintech-gold text-[#05080F] font-bold text-sm hover:scale-105 transition-transform">
                      Link Bank Account
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Hosted Pools */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="text-fintech-gold" /> My Shared Pools
                </h2>
              </div>
              
              <div className="space-y-4">
                {myPools && myPools.length > 0 ? (
                  myPools.map((pool: any) => {
                    const isUpdating = updatingPoolId === pool.id;

                    return (
                      <div key={pool.id} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-white">{pool.service_name}</h3>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-white">
                            {pool.current_seats} / {pool.max_seats} Seats
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-4">
                          <span className="text-fintech-gold font-bold">₦{pool.price_per_seat.toLocaleString()} <span className="text-fintech-slate/50">/ seat</span></span>
                          <Link href={`/pools/${pool.id}`} className="text-white/50 hover:text-fintech-gold flex items-center gap-1">
                            View <ArrowRight size={14} />
                          </Link>
                        </div>

                        {/* PRIVATE POOL INVITE LINK */}
                        {!pool.is_public && pool.invite_token && (
                          <div className="mt-2 mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                            <div className="flex justify-between items-center text-white/50 mb-2 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1.5"><Link2 size={12}/> Invite Link</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 truncate bg-[#05080F] border border-white/10 px-2 py-1.5 rounded text-fintech-gold">
                                {window.location.origin}/pools/join?token={pool.invite_token}
                              </code>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/pools/join?token=${pool.invite_token}`)
                                  alert('Copied to clipboard!')
                                }}
                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-white"
                                title="Copy Link"
                              >
                                <Copy size={14} />
                              </button>
                              <button 
                                onClick={() => regenerateInviteLink(pool.id)}
                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-white"
                                title="Regenerate Link"
                              >
                                <RefreshCw size={14} />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* RESTORED EDIT VAULT FEATURE */}
                        {!isUpdating ? (
                          <button 
                            onClick={() => setUpdatingPoolId(pool.id)}
                            className="w-full text-sm text-fintech-slate/50 hover:text-fintech-gold font-medium flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10 transition-colors"
                          >
                            <Key size={14} /> Update Vault Credentials
                          </button>
                        ) : (
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-bold text-fintech-gold uppercase flex items-center gap-1">
                                <Edit3 size={12}/> Edit Vault
                              </span>
                              <button onClick={() => setUpdatingPoolId(null)} className="text-white/50 hover:text-white">
                                <X size={16} />
                              </button>
                            </div>
                            <div className="space-y-3">
                              <input 
                                type="text" 
                                placeholder="New Login Email" 
                                value={updateForm.username}
                                onChange={(e) => setUpdateForm({...updateForm, username: e.target.value})}
                                className="w-full bg-[#05080F] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-fintech-gold placeholder:text-gray-600"
                              />
                              <input 
                                type="password" 
                                placeholder="New Password" 
                                value={updateForm.password}
                                onChange={(e) => setUpdateForm({...updateForm, password: e.target.value})}
                                className="w-full bg-[#05080F] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-fintech-gold placeholder:text-gray-600"
                              />
                              <Button 
                                onClick={() => handleUpdateCredentials(pool.id)}
                                isLoading={isEncrypting}
                                className="w-full bg-fintech-gold text-[#05080F] hover:bg-fintech-gold/90 font-bold py-2 h-auto mt-1"
                              >
                                Secure & Save Password
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/20 text-center">
                    <div className="w-12 h-12 bg-fintech-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlusCircle className="text-fintech-gold" size={24} />
                    </div>
                    <p className="text-white font-bold mb-2">No pools yet</p>
                    <p className="text-white/40 text-sm mb-4">Create your first pool and start earning from your unused subscription seats.</p>
                    <Link href="/create-pool">
                      <button className="px-6 py-2.5 rounded-xl bg-fintech-gold text-[#05080F] font-bold text-sm hover:scale-105 transition-transform">
                        Create Your First Pool
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  )
}
// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wallet, Users, ArrowRight, Settings, PlusCircle, CreditCard } from 'lucide-react'
import WithdrawButton from './WithdrawButton'
import { EscrowTimer } from '@/components/ui/EscrowTimer'

export default async function DashboardPage() {
  const supabase = createClient()

  // 1. Get User
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/auth')

  // 2. Get Profile & Balance
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  const profile = data as { email: string; balance: number } | null

  // 3. Get Pools where user is Host
  const { data: myPools } = await supabase
    .from('pools')
    .select('*')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  // 4. Get Memberships where user is Member
  const { data: myMemberships } = await supabase
    .from('pool_members')
    .select(`
      *,
      pools (*)
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  // 5. Fetch their Payout/Withdrawal History
  const { data: payouts } = await supabase
    .from('payouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome back!</h1>
          <p className="text-fintech-slate/70">{profile?.email}</p>
        </div>
        <Link href="/dashboard/settings">
          <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
            <Settings size={18} /> Settings
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Balance Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-fintech-navy to-[#0a1224] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fintech-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-fintech-gold font-medium mb-4">
                <Wallet size={20} />
                <span>Available Balance</span>
              </div>
              <div className="text-5xl font-black text-white mb-8 tracking-tight">
                ₦{profile?.balance?.toLocaleString() || '0'}
              </div>
              
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

          {/* Withdrawal History */}
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

          {/* Joined Pools (Member) */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Joined Pools (Member)</h2>
              <Link href="/browse" className="text-sm font-medium text-fintech-gold hover:underline">
                Browse Marketplace →
              </Link>
            </div>
            
            <div className="space-y-4">
              {myMemberships && myMemberships.length > 0 ? (
                myMemberships.map((membership: any) => {
                  const joinedDate = new Date(membership.joined_at).getTime()
                  const expiresAtIso = new Date(joinedDate + 48 * 60 * 60 * 1000).toISOString()

                  return (
                    <div key={membership.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-white/10 transition-colors">
                      <div>
                        <h3 className="font-bold text-white text-lg">{membership.pools.service_name}</h3>
                        <p className="text-sm text-fintech-slate/50">Joined {new Date(membership.joined_at).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {membership.escrow_status === 'held' && (
                          <div className="text-right flex flex-col items-end">
                            <div className="text-[10px] text-fintech-gold uppercase tracking-wider font-bold mb-1">Escrow Timer</div>
                            <EscrowTimer expiresAt={expiresAtIso} />
                          </div>
                        )}
                        
                        <Link href={`/dashboard/subscriptions`}>
                          <button className="px-4 py-2 rounded-lg bg-fintech-gold text-fintech-navy font-bold text-sm hover:scale-105 transition-transform">
                            Manage
                          </button>
                        </Link>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-fintech-slate/50 mb-4">You haven't joined any pools yet.</p>
                  <Link href="/browse">
                    <button className="px-5 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
                      Explore Marketplace
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {/* Hosted Pools */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="text-fintech-gold" /> My Shared Pools
              </h2>
            </div>
            
            <div className="space-y-4">
              {myPools && myPools.length > 0 ? (
                myPools.map((pool: any) => (
                  <div key={pool.id} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-white">{pool.service_name}</h3>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-white">
                        {pool.current_seats} / {pool.max_seats} Seats
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-fintech-gold font-bold">₦{pool.price_per_seat.toLocaleString()} <span className="text-fintech-slate/50">/ seat</span></span>
                      <Link href={`/pools/${pool.id}`} className="text-white hover:text-fintech-gold flex items-center gap-1">
                        View <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-fintech-slate/50 text-sm">You are not hosting any pools.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
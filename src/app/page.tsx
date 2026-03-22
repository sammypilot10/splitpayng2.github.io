// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { Button } from '@/components/ui/Button'
import { encryptData } from '@/lib/crypto'
import { Wallet, Users, Key, Loader2, Edit3, X, CheckCircle2 } from 'lucide-react'

function HostDashboardContent() {
  const [pools, setPools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  
  // State for updating credentials
  const [updatingPoolId, setUpdatingPoolId] = useState<string | null>(null)
  const [updateForm, setUpdateForm] = useState({ username: '', password: '' })
  const [isEncrypting, setIsEncrypting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchHostPools()
  }, [])

  const fetchHostPools = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('pools')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setPools(data)
    setLoading(false)
  }

  const handleWithdraw = async (poolId: string) => {
    setWithdrawingId(poolId)
    try {
      const res = await fetch('/api/payouts/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to process withdrawal')
      
      alert('Withdrawal successful! The funds are on the way to your bank account.')
    } catch (err: any) {
      alert('Withdrawal error: ' + err.message)
    } finally {
      setWithdrawingId(null)
    }
  }

  const handleUpdateCredentials = async (poolId: string) => {
    if (!updateForm.username || !updateForm.password) {
      alert("Please enter both the login email and password.")
      return
    }

    setIsEncrypting(true)
    try {
      const rawString = JSON.stringify(updateForm)
      const cryptoResult = await encryptData(rawString) as any
      const encryptedData = cryptoResult.encryptedData || cryptoResult.ciphertext || cryptoResult
      const iv = cryptoResult.iv || ''

      const res = await fetch('/api/credentials/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, encryptedData, iv })
      })

      if (!res.ok) throw new Error("Failed to update credentials in database.")

      alert("Vault Updated Successfully! Your members will now see the new password.")
      setUpdatingPoolId(null)
      setUpdateForm({ username: '', password: '' })
    } catch (err: any) {
      alert("Error updating vault: " + err.message)
    } finally {
      setIsEncrypting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-fintech-navy">
        <Loader2 className="animate-spin mb-4 text-fintech-gold" size={40} />
        <p className="font-medium">Loading your portfolio...</p>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-fintech-navy tracking-tight">Host Dashboard</h1>
        <p className="text-gray-500 mt-2">Manage your pools, update credentials, and withdraw your earnings.</p>
      </div>

      {pools.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-fintech-navy mb-2">No active pools</h3>
          <p className="text-gray-500 mb-6">Create a pool to start earning money from unused subscription seats.</p>
          {/* 🔥 THIS IS THE MAGIC FIX RIGHT HERE */}
          <Button onClick={() => window.location.href = '/create-pool'} className="bg-fintech-navy">Create New Pool</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {pools.map((pool) => {
            const totalEarned = (pool.price_per_seat * pool.current_seats) * 0.8;
            const isUpdating = updatingPoolId === pool.id;

            return (
              <div key={pool.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-fintech-navy">{pool.service_name}</h3>
                    <p className="text-sm font-medium text-gray-500">₦{pool.price_per_seat.toLocaleString()} per seat</p>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 ${pool.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {pool.status === 'active' ? <CheckCircle2 size={12} /> : null} {pool.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                   <div className="flex items-center gap-2 text-gray-600">
                     <Users size={16} className="text-fintech-gold" />
                     <span className="text-sm font-bold">{pool.current_seats} / {pool.max_seats} Filled</span>
                   </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Available to Withdraw</p>
                    <p className="text-2xl font-bold text-fintech-navy">₦{totalEarned.toLocaleString()}</p>
                  </div>
                  <Button 
                    onClick={() => handleWithdraw(pool.id)}
                    isLoading={withdrawingId === pool.id}
                    disabled={totalEarned === 0 || withdrawingId === pool.id}
                    className="bg-fintech-navy hover:bg-fintech-navy/90 text-sm py-2 px-4 h-auto"
                  >
                    Withdraw
                  </Button>
                </div>

                <div className="mt-auto pt-2">
                  {!isUpdating ? (
                    <button 
                      onClick={() => setUpdatingPoolId(pool.id)}
                      className="w-full text-sm text-gray-500 hover:text-fintech-navy font-medium flex items-center justify-center gap-2 py-2 transition-colors"
                    >
                      <Key size={14} /> Update Vault Credentials
                    </button>
                  ) : (
                    <div className="bg-fintech-navy rounded-2xl p-4 mt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-fintech-gold uppercase flex items-center gap-1">
                          <Edit3 size={12}/> Edit Vault
                        </span>
                        <button onClick={() => setUpdatingPoolId(null)} className="text-gray-400 hover:text-white">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="New Login Email / Username" 
                          value={updateForm.username}
                          onChange={(e) => setUpdateForm({...updateForm, username: e.target.value})}
                          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-fintech-gold placeholder:text-gray-400"
                        />
                        <input 
                          type="password" 
                          placeholder="New Password" 
                          value={updateForm.password}
                          onChange={(e) => setUpdateForm({...updateForm, password: e.target.value})}
                          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-fintech-gold placeholder:text-gray-400"
                        />
                        <Button 
                          onClick={() => handleUpdateCredentials(pool.id)}
                          isLoading={isEncrypting}
                          className="w-full bg-fintech-gold text-fintech-navy hover:bg-fintech-gold/90 font-bold py-2 h-auto mt-1"
                        >
                          Secure & Save New Password
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-fintech-slate">
      <AppNavbar userRole="host" />
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-fintech-gold" size={40}/></div>}>
        <HostDashboardContent />
      </Suspense>
    </div>
  )
}
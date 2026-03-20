// src/app/admin/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { KPICard } from '@/components/admin/KPICard'
import { Wallet, Users, LayoutGrid, AlertTriangle, RefreshCcw } from 'lucide-react'

// Prevent Next.js from caching this page so the stats are always live!
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // 1. Fetch GMV (Total successful transaction volume)
  // We use 'as any' because the transactions table was added directly in SQL
  const { data: transactions } = await (supabase.from('transactions') as any)
    .select('amount')
    .eq('status', 'success')
  
  const totalGMV = transactions?.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0

  // 2. Fetch Total Users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 3. Fetch Active Pools
  const { count: activePools } = await supabase
    .from('pools')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // 4. Fetch Dispute Rate
  const { count: totalEscrows } = await supabase
    .from('pool_members')
    .select('*', { count: 'exact', head: true })
    
  const { count: disputedEscrows } = await supabase
    .from('pool_members')
    .select('*', { count: 'exact', head: true })
    .eq('escrow_status', 'disputed')

  const disputeRate = totalEscrows && totalEscrows > 0 
    ? ((disputedEscrows || 0) / totalEscrows) * 100 
    : 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-bold text-[#0A0F1E]">Platform Overview</h1>
        <p className="text-gray-500">Real-time metrics for SplitPayNG.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total GMV (All Time)" 
          value={`₦${totalGMV.toLocaleString()}`} 
          trend="Live" 
          trendUp={true} 
          icon={Wallet} 
        />
        <KPICard 
          title="Total Users" 
          value={(totalUsers || 0).toLocaleString()} 
          trend="Live" 
          trendUp={true} 
          icon={Users} 
        />
        <KPICard 
          title="Active Pools" 
          value={(activePools || 0).toLocaleString()} 
          trend="Live" 
          trendUp={true} 
          icon={LayoutGrid} 
        />
        <KPICard 
          title="Dispute Rate" 
          value={`${disputeRate.toFixed(1)}%`} 
          trend={`${disputedEscrows || 0} active`} 
          trendUp={disputeRate < 5} 
          icon={AlertTriangle} 
          iconColor={disputeRate > 5 ? "text-red-500" : "text-amber-500"}
          iconBg={disputeRate > 5 ? "bg-red-50" : "bg-amber-50"}
        />
      </div>

      {/* Placeholder for Revenue Chart */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-96 flex items-center justify-center">
        <p className="text-gray-400 font-medium flex flex-col items-center gap-2">
          <RefreshCcw size={32} className="animate-pulse" />
          Revenue Trend Chart (Integration Ready)
        </p>
      </div>
    </div>
  )
}
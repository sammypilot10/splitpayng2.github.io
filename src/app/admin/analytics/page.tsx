// src/app/admin/analytics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import { RefreshCcw, Loader2 } from 'lucide-react'

// 🔥 THE FIX: Tell TypeScript exactly what goes inside the array
type MonthBucket = {
  name: string;
  month: number;
  year: number;
  revenue: number;
  users: number;
}

export default function AdminAnalyticsPage() {
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [userGrowthData, setUserGrowthData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLiveAnalytics = async () => {
      setLoading(true)

      // 🔥 THE FIX: Apply the type to the empty array
      const monthBuckets: MonthBucket[] = []
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        monthBuckets.push({
          name: d.toLocaleString('default', { month: 'short' }),
          month: d.getMonth(),
          year: d.getFullYear(),
          revenue: 0,
          users: 0
        })
      }

      // Fetch live transactions and profiles from Supabase
      const { data: txs } = await (supabase.from('transactions') as any)
        .select('amount, created_at')
        .eq('status', 'success')
        
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')

      // Process Revenue: Sort transactions into their correct month bucket
      if (txs) {
        txs.forEach((tx: any) => {
          const date = new Date(tx.created_at)
          const bucket = monthBuckets.find(b => b.month === date.getMonth() && b.year === date.getFullYear())
          if (bucket) {
            bucket.revenue += (tx.amount || 0)
          }
        })
      }

      // Process Users: Sort user signups into their correct month bucket
      if (profiles) {
        profiles.forEach((profile: any) => {
          const date = new Date(profile.created_at)
          const bucket = monthBuckets.find(b => b.month === date.getMonth() && b.year === date.getFullYear())
          if (bucket) {
            bucket.users += 1
          }
        })
      }

      // Save the formatted data for the charts
      setRevenueData(monthBuckets.map(b => ({ name: b.name, revenue: b.revenue })))
      setUserGrowthData(monthBuckets.map(b => ({ name: b.name, users: b.users })))
      
      setLoading(false)
    }

    fetchLiveAnalytics()
  }, [supabase])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
          <RefreshCcw size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0A0F1E]">Advanced Analytics</h1>
          <p className="text-sm text-gray-500">Deep dive into platform growth and revenue.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-96 w-full flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100">
          <Loader2 className="animate-spin text-fintech-gold mb-4" size={40} />
          <p className="text-gray-500 font-medium">Crunching live data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Line Chart */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-fintech-navy mb-6">Revenue Forecasting (6 Months)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `₦${value >= 1000 ? value / 1000 + 'k' : value}`}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#C9A84C" 
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#C9A84C' }}
                    activeDot={{ r: 8, fill: '#C9A84C', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* User Growth Bar Chart */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-fintech-navy mb-6">User Acquisition (6 Months)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    allowDecimals={false}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="users" 
                    fill="#0A0F1E" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
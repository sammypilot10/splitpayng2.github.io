// src/app/admin/payouts/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/DataTable'
import { AdminStatusBadge } from '@/components/admin/StatusBadge'
import { Banknote } from 'lucide-react'

export default function AdminPayoutsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTxs = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('transactions')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })
      
      setTransactions(data || [])
      setLoading(false)
    }
    fetchTxs()
  }, [supabase])

  const columns = [
    { key: 'reference', header: 'Paystack Ref', render: (val: string) => <span className="font-mono text-xs text-gray-500">{val?.substring(0, 12)}...</span> },
    { key: 'user', header: 'User Email', render: (_: any, row: any) => <span className="font-medium text-[#0A0F1E]">{row.profiles?.email || 'Unknown'}</span> },
    { key: 'amount', header: 'Amount', render: (val: number) => <span className="font-bold">₦{val?.toLocaleString() || 0}</span> },
    { key: 'status', header: 'Status', render: (val: string) => <AdminStatusBadge status={val || 'success'} /> },
    { key: 'created_at', header: 'Date Processed', render: (val: string) => <span className="text-sm text-gray-500">{new Date(val).toLocaleDateString()}</span> },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-50 rounded-2xl text-green-600">
          <Banknote size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0A0F1E]">Transactions & Payouts</h1>
          <p className="text-sm text-gray-500">Track all incoming payments and host withdrawals.</p>
        </div>
      </div>
      <DataTable columns={columns} data={transactions} loading={loading} />
    </div>
  )
}
// src/app/admin/pools/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/DataTable'
import { AdminStatusBadge } from '@/components/admin/StatusBadge'
import { Layers } from 'lucide-react'

export default function AdminPoolsPage() {
  const [pools, setPools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchPools = async () => {
      setLoading(true)
      // Fetch all pools and attach the email of the Host who created them
      const { data } = await supabase
        .from('pools')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })
      
      setPools(data || [])
      setLoading(false)
    }
    fetchPools()
  }, [supabase])

  const columns = [
    { key: 'id', header: 'Pool ID', render: (val: string) => <span className="font-mono text-xs text-gray-500">{val.substring(0, 8)}...</span> },
    { key: 'service_name', header: 'Service' },
    { key: 'host', header: 'Host Email', render: (_: any, row: any) => <span className="font-medium text-[#0A0F1E]">{row.profiles?.email || 'Unknown'}</span> },
    { key: 'price_per_seat', header: 'Price/Seat', render: (val: number) => <span className="font-bold">₦{val.toLocaleString()}</span> },
    { key: 'capacity', header: 'Capacity', render: (_: any, row: any) => `${row.current_seats}/${row.max_seats}` },
    { key: 'status', header: 'Status', render: (val: string) => <AdminStatusBadge status={val} /> },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-fintech-gold/10 rounded-2xl text-fintech-gold">
          <Layers size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0A0F1E]">Platform Pools</h1>
          <p className="text-sm text-gray-500">Monitor all active and closed subscription pools.</p>
        </div>
      </div>
      <DataTable columns={columns} data={pools} loading={loading} />
    </div>
  )
}
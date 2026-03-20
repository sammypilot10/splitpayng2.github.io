// src/app/admin/audit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/DataTable'
import { ScrollText } from 'lucide-react'

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('audit_logs')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })
        .limit(50)
      
      setLogs(data || [])
      setLoading(false)
    }
    fetchLogs()
  }, [supabase])

  const columns = [
    { key: 'created_at', header: 'Timestamp', render: (val: string) => <span className="text-xs text-gray-500">{new Date(val).toLocaleString()}</span> },
    { key: 'actor', header: 'Actor (Admin)', render: (_: any, row: any) => <span className="font-medium text-[#0A0F1E]">{row.profiles?.email || 'System'}</span> },
    { key: 'action', header: 'Action Taken', render: (val: string) => <span className="font-bold text-fintech-navy">{val}</span> },
    { key: 'entity_table', header: 'Target Table' },
    { key: 'details', header: 'Details', render: (_: any, row: any) => <span className="text-xs text-gray-400 font-mono truncate max-w-xs block">{JSON.stringify(row.new_data)}</span> },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-2xl text-gray-600">
          <ScrollText size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0A0F1E]">System Audit Logs</h1>
          <p className="text-sm text-gray-500">Security trail of all administrative and system actions.</p>
        </div>
      </div>
      <DataTable columns={columns} data={logs} loading={loading} />
    </div>
  )
}
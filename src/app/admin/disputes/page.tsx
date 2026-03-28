// src/app/admin/disputes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { AdminStatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/Button'
import { ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRefunds()
  }, [])

  const fetchRefunds = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/disputes')
      const data = await res.json()
      setRefunds(data.disputes || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  // Handle Action now takes 'refund' or 'reject'
  const handleAction = async (memberId: string, email: string, serviceName: string, action: 'refund' | 'reject') => {
    const actionText = action === 'refund' ? 'issue a full refund to' : 'REJECT the dispute and restore access for'
    if (!window.confirm(`Are you sure you want to ${actionText} ${email} for ${serviceName}?`)) return
    
    setProcessingId(memberId)
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, action })
      })
      
      const responseBody = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(responseBody.error || 'Failed to process action')
      
      alert(`Action successful!`)
      fetchRefunds() 
    } catch (err: any) {
      alert('Error processing action: ' + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const columns = [
    { key: 'id', header: 'Case ID', render: (val: string) => <span className="font-mono text-xs text-gray-500">{val.substring(0, 8)}</span> },
    { key: 'user', header: 'User Email', render: (_: any, row: any) => <span className="font-medium text-[#0A0F1E]">{row.profiles?.email || 'Unknown'}</span> },
    { key: 'service', header: 'Disputed Pool', render: (_: any, row: any) => <span className="text-gray-600">{row.pools?.service_name || 'N/A'}</span> },
    { key: 'amount', header: 'Escrow Amount', render: (_: any, row: any) => <span className="font-bold text-[#0A0F1E]">₦{row.pools?.price_per_seat?.toLocaleString() || 0}</span> },
    { key: 'escrow_status', header: 'Status', render: (val: string) => <AdminStatusBadge status={val} /> },
    { key: 'joined_at', header: 'Date Raised', render: (val: string) => <span className="text-sm text-gray-500">{new Date(val).toLocaleDateString()}</span> },
    { 
      key: 'actions', 
      header: 'Admin Verification & Actions', 
      render: (_: any, row: any) => (
        row.escrow_status === 'disputed' ? (
          <div className="flex gap-2 items-center">
            <Button 
              onClick={() => handleAction(row.id, row.profiles?.email, row.pools?.service_name, 'refund')} 
              isLoading={processingId === row.id}
              className="bg-red-500 hover:bg-red-600 text-white text-[10px] py-1.5 px-3 h-auto shadow-sm tracking-wider uppercase"
            >
              Refund Member
            </Button>
            <Button 
              onClick={() => handleAction(row.id, row.profiles?.email, row.pools?.service_name, 'reject')} 
              isLoading={processingId === row.id}
              className="bg-gray-800 hover:bg-black text-white text-[10px] py-1.5 px-3 h-auto shadow-sm tracking-wider uppercase"
            >
              Reject Dispute
            </Button>
            {row.host_whatsapp && (
              <Button 
                onClick={() => window.open(`https://wa.me/${row.host_whatsapp.replace(/\D/g, '')}?text=Hello,%20this%20is%20SplitPayNG%20Admin.%20There%20is%20an%20active%20dispute%20on%20your%20${encodeURIComponent(row.pools?.service_name)}%20pool.`, '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white text-[10px] py-1.5 px-3 h-auto shadow-sm tracking-wider uppercase ml-2"
              >
                Contact Host
              </Button>
            )}
          </div>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full w-fit">
            <CheckCircle2 size={14} /> Closed
          </span>
        )
      ) 
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl text-red-500 border border-red-100">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0A0F1E]">Disputes & Refunds</h1>
            <p className="text-sm text-gray-500">Manage user disputes and process escrow refunds safely.</p>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={refunds} loading={loading} />
    </div>
  )
}
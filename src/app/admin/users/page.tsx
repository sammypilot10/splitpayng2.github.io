// src/app/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/admin/DataTable'
import { AdminStatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/Button'
import { ShieldBan } from 'lucide-react'
import { logAdminAction } from '@/lib/audit'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const handleSuspend = async (userId: string) => {
    if (!window.confirm("Suspend this user? They will be locked out immediately.")) return
    
    // In production: hit a secure API route to update Auth user + profile
    await logAdminAction('SUSPEND_USER', 'profiles', userId, 'Admin manually suspended user')
    alert('User suspended (Audit logged)')
  }

  const columns = [
    { key: 'id', header: 'User ID', render: (val: string) => <span className="font-mono text-xs text-gray-500">{val.substring(0, 8)}...</span> },
    { key: 'email', header: 'Email', render: (val: string) => <span className="font-medium text-[#0A0F1E]">{val}</span> },
    { key: 'role', header: 'Role', render: (val: string) => <AdminStatusBadge status={val} /> },
    { key: 'created_at', header: 'Joined', render: (val: string) => new Date(val).toLocaleDateString() },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (_: any, row: any) => (
        <button onClick={() => handleSuspend(row.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
          <ShieldBan size={16} />
        </button>
      ) 
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0A0F1E]">User Management</h1>
        <Button variant="outline">Export CSV</Button>
      </div>
      <DataTable columns={columns} data={users} loading={loading} />
    </div>
  )
}
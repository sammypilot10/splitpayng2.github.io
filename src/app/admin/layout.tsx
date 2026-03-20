// src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = data as { role: string } | null

  // 🔍 THE X-RAY LOGS: Look at your VS Code Terminal after you try to load the page!
  console.log("=========================================")
  console.log("🎯 ADMIN SECURE CHECK FOR USER:", user.email)
  console.log("🎯 DATABASE RETURNED ROLE:", profile?.role)
  console.log("🎯 DATABASE ERRORS?:", error?.message || "None")
  console.log("=========================================")

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
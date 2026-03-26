// src/app/create-pool/page.tsx
import { redirect } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { CreatePoolWizard } from '@/components/pools/CreatePoolWizard'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { createClient } from '@/lib/supabase/server'

export default async function CreatePoolPage() {
  // Fetch user securely on the server
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 🔥 MANDATORY PAYOUT ACCOUNT GUARD
  if (user) {
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('account_number, bank_code')
      .eq('id', user.id)
      .single()

    if (!profile?.account_number || !profile?.bank_code) {
      redirect('/dashboard/settings?message=Please set up your payout account before creating a pool')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['host', 'admin']}>
      <div className="min-h-screen bg-fintech-slate flex flex-col">
        <AppNavbar userRole="host" />
        
        <main className="flex-grow py-12 px-6">
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <h1 className="text-3xl font-bold text-fintech-navy mb-2">Host a Subscription</h1>
            <p className="text-gray-500">Fill empty seats and earn money securely via Paystack.</p>
          </div>
          
          {/* Pass the server-verified ID directly into the client wizard */}
          <CreatePoolWizard hostId={user?.id || ''} />
        </main>
      </div>
    </ProtectedRoute>
  )
}
// src/app/pools/join/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNavbar } from '@/components/layout/AppNavbar'

export const dynamic = 'force-dynamic'

export default async function JoinViaInvitePage({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token
  if (!token) redirect('/browse')

  const supabase = createClient()
  
  // Find pool by invite token
  const { data: pool } = await (supabase.from('pools') as any)
    .select('id, status, is_public')
    .eq('invite_token', token)
    .single()

  if (!pool || pool.status !== 'active') {
    return (
      <div className="min-h-screen bg-[#05080F] flex flex-col">
        <AppNavbar />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Invite Link Invalid or Expired</h1>
          <p className="text-white/50 mb-6">This private pool could not be found or is no longer active.</p>
          <a href="/browse" className="px-6 py-3 bg-fintech-gold text-[#05080F] font-bold rounded-xl hover:bg-fintech-gold/90 transition-colors">Return to Marketplace</a>
        </main>
      </div>
    )
  }

  // Redirect to the regular pool details page, which already handles checking max seats, payment, etc.
  redirect(`/pools/${pool.id}`)
}

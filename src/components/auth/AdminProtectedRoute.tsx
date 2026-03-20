import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/auth'

export async function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getUserProfile()

  if (!user || profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
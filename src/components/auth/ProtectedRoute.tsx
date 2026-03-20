// src/components/auth/ProtectedRoute.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: ('host' | 'member' | 'admin')[] }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. If not logged in at all, go to auth page
  if (!user) redirect('/auth')

  // 2. If the route has strict role requirements, check them
  if (allowedRoles) {
    const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    
    // DEBUG LOG: This will print in your VS Code terminal if Supabase fails
    if (error) {
      console.error("🔴 SUPABASE PROFILE ERROR:", error.message)
    }

    const profile = data as Pick<Profile, 'role'> | null;
    
    // 3. If the user's role isn't allowed, route them to their correct home
    if (!profile || !allowedRoles.includes(profile.role as any)) {
      if (profile?.role === 'member') {
        // 🔥 THE FIX: Tell the guard to send Members to the Vault!
        redirect('/dashboard/subscriptions')
      } else if (profile?.role === 'host' || profile?.role === 'admin') {
        redirect('/dashboard')
      } else {
        // DEBUG LOG: Catch ghost users
        console.error("🔴 NO PROFILE FOUND FOR USER. FALLING BACK TO HOME.")
        redirect('/') 
      }
    }
  }

  return <>{children}</>
}
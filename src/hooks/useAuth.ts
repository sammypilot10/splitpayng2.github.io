import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { User } from '@supabase/supabase-js'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  isHost: boolean
  fetchProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isHost: false,
  fetchProfile: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
      // Explicitly type the result
      const profile = data as Profile | null;
        
      set({ 
        user, 
        profile, 
        isAdmin: profile?.role === 'admin',
        isHost: profile?.role === 'host',
        loading: false 
      })
    } else {
      set({ user: null, profile: null, isAdmin: false, isHost: false, loading: false })
    }
  },
  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null, isAdmin: false, isHost: false, loading: false })
    window.location.href = '/auth'
  }
}))
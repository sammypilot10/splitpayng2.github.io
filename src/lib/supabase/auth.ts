import { createClient } from './server'
import { Database } from '@/types/supabase'

// Explicitly define the Profile type from our generated database types
type Profile = Database['public']['Tables']['profiles']['Row']

export async function getUserProfile() {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) return { user: null, profile: null }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Cast the data to Profile to prevent TypeScript from inferring 'never'
  const profile = data as Profile | null

  return { user, profile }
}
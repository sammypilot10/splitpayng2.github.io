// src/lib/supabase/server.ts
// ==============================================================================
// Server-side Supabase client using the modern getAll/setAll cookie API.
// The old get/set/remove pattern silently swallowed token refreshes, causing
// the "have to clear cache to log in" bug.
// ==============================================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
              })
            )
          } catch {
            // setAll is called from a Server Component where cookies are read-only.
            // This is expected — the middleware handles the actual cookie writes.
          }
        },
      },
    }
  )
}
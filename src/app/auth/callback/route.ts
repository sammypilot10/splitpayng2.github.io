// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emails' // 🔥 Imported your walkie-talkie!

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Get the requested next route
  let next = searchParams.get('next')

  if (code) {
    const supabase = createClient()
    
    // Rename to 'authData' to avoid confusing TypeScript later
    const { error, data: authData } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && authData.user) {
      
      // 🔥 THE SPAM PREVENTER: Check if this user was created in the last 60 seconds
      const userCreationTime = new Date(authData.user.created_at).getTime()
      const currentTime = new Date().getTime()
      const isBrandNewUser = (currentTime - userCreationTime) < 60000 // 60,000 milliseconds = 1 minute

      // If they are brand new, blast the Welcome Email!
      if (isBrandNewUser && authData.user.email) {
        await sendEmail({
          to: authData.user.email,
          subject: 'Welcome to SplitPayNG!',
          template: 'WELCOME_USER'
        });
      }

      // 🔥 THE SMART ROUTER: Check role if no specific route was given
      if (!next || next === '/dashboard') {
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()

        // Explicitly tell TypeScript what this data looks like
        const profile = profileData as { role: string } | null

        // Now TypeScript knows 'role' exists!
        if (profile?.role === 'host' || profile?.role === 'admin') {
          next = '/dashboard'
        } else {
          next = '/dashboard/subscriptions'
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to auth page with error flag
  return NextResponse.redirect(`${origin}/auth?error=Could not authenticate`)
}
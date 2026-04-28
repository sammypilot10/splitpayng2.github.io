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
      
      // Check if this is truly a brand new user (created within last 2 minutes)
      // and they haven't logged in before (no prior sessions means first login)
      const userCreationTime = new Date(authData.user.created_at).getTime()
      const currentTime = new Date().getTime()
      const isBrandNewUser = (currentTime - userCreationTime) < 120000 // 2 minutes window

      if (isBrandNewUser && authData.user.email) {
        try {
          await sendEmail({
            to: authData.user.email,
            subject: 'Welcome to SplitPayNG! 🎉',
            template: 'WELCOME_USER'
          });
          console.log(`[AUTH] Welcome email sent to ${authData.user.email}`)
        } catch (emailErr) {
          console.error('[AUTH] Welcome email failed (non-fatal):', emailErr)
          // Never block the auth flow for email failures
        }
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
// middleware.ts
// ==============================================================================
// SINGLE middleware at the project root. The duplicate at src/middleware.ts
// has been removed. This uses the modern getAll/setAll cookie API required
// by @supabase/ssr >= 0.5 to ensure refreshed auth tokens are always written
// back to the browser. This is the #1 cause of "have to clear cache to log in".
// ==============================================================================

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SESSION_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

export async function middleware(request: NextRequest) {
  // Start with a fresh response that forwards the original request headers
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ── Modern cookie API (required by @supabase/ssr >= 0.5) ──
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Set on the request (so downstream Server Components can read them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // 2. Recreate response with the updated request
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          // 3. Set on the response (so the browser actually stores them)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
            })
          )
        },
      },
    }
  )

  // ══════════════════════════════════════════════════════════════════════
  // CRITICAL: supabase.auth.getUser() does TWO things:
  //   1. Validates the access token against Supabase servers
  //   2. If expired, automatically refreshes it and calls setAll()
  // Without this call, stale tokens never get replaced → users appear
  // "logged out" until they manually clear cookies.
  // ══════════════════════════════════════════════════════════════════════
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Emergency maintenance mode - set MAINTENANCE_MODE=true in Vercel env to block all traffic
  if (process.env.MAINTENANCE_MODE === 'true') {
    const maintenanceUrl = new URL('/maintenance', request.url)
    if (path !== '/maintenance' && !path.startsWith('/api')) {
      return NextResponse.redirect(maintenanceUrl)
    }
  }

  // ── Route protection ──────────────────────────────────────────────
  const isProtected =
    path.startsWith('/dashboard') ||
    path.startsWith('/create-pool')
  const isAdmin = path.startsWith('/admin')

  if ((isProtected || isAdmin) && !user) {
    const authUrl = new URL('/auth', request.url)
    authUrl.searchParams.set('returnTo', path)
    return NextResponse.redirect(authUrl)
  }

  // ── Session timeout (inactivity guard) ────────────────────────────
  if (user) {
    const lastActive = request.cookies.get('sp_last_active')?.value
    const now = Date.now()

    if (lastActive && now - parseInt(lastActive) > SESSION_TIMEOUT_MS) {
      await supabase.auth.signOut()
      response = NextResponse.redirect(
        new URL('/auth?timeout=true', request.url)
      )
      response.cookies.delete('sp_last_active')
      return response
    }

    response.cookies.set('sp_last_active', now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
    })
  }

  return response
}

export const config = {
  matcher: [
    // Run on all routes EXCEPT static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
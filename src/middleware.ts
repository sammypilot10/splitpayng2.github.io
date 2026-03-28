import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) { response.cookies.set({ name, value, ...options, httpOnly: true, secure: process.env.NODE_ENV === 'production' }) },
        remove(name, options) { response.cookies.set({ name, value: '', ...options, httpOnly: true }) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  const isProtected = path.startsWith('/dashboard') || path.startsWith('/dashboard/subscriptions') || path.startsWith('/create-pool')
  const isAdmin = path.startsWith('/admin')

  if ((isProtected || isAdmin) && !user) {
    const authUrl = new URL('/auth', request.url)
    authUrl.searchParams.set('returnTo', path)
    return NextResponse.redirect(authUrl)
  }

  if (user) {
    const lastActive = request.cookies.get('sp_last_active')?.value;
    const now = Date.now();
    if (lastActive && now - parseInt(lastActive) > SESSION_TIMEOUT_MS) {
      await supabase.auth.signOut();
      response = NextResponse.redirect(new URL('/auth?timeout=true', request.url));
      response.cookies.delete('sp_last_active');
      return response;
    }
    response.cookies.set('sp_last_active', now.toString(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
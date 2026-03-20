// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, { ...options, httpOnly: true, secure: process.env.NODE_ENV === 'production' })
          )
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Route Protection Logic
  const isProtected = request.nextUrl.pathname.startsWith('/dashboard');
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');

  if ((isProtected || isAdmin) && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Session Timeout Logic Stub (Client will handle the 2-min warning modal)
  if (user) {
    const lastActive = request.cookies.get('sp_last_active')?.value;
    const now = Date.now();
    
    if (lastActive && now - parseInt(lastActive) > SESSION_TIMEOUT_MS) {
      // Force logout if inactive
      await supabase.auth.signOut();
      response = NextResponse.redirect(new URL('/login?timeout=true', request.url));
      response.cookies.delete('sp_last_active');
      return response;
    }
    
    // Update activity timestamp
    response.cookies.set('sp_last_active', now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15 minutes
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
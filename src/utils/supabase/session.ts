import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  
  // LOGGING FOR DIAGNOSTICS
  console.log(`[proxy] Request: ${pathname} | User: ${user?.email || 'Anonymous'}`)

  const isPublicRoute = 
    pathname === '/' ||
    pathname === '/setup' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/docs') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy');

  if (!user && !isPublicRoute) {
    console.log(`[proxy] Blocking unauthenticated access to ${pathname} -> Redirecting to /login`)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && pathname.startsWith('/login')) {
      console.log(`[proxy] Authenticated user on /login -> Redirecting to /dashboard`)
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
  }

  return supabaseResponse
}

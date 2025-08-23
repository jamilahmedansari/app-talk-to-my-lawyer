import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Only run middleware in production or when Supabase is configured
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return
  }

  try {
    // Lazy load Supabase middleware to prevent build-time execution
    const { createClient } = await import('@/utils/supabase/middleware')
    const { supabase, response } = createClient(request)

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    return response
  } catch (error) {
    console.warn('Middleware error:', error)
    // Return a default response if middleware fails
    return new Response(null, { status: 200 })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (to avoid Edge Runtime issues)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { ProxyConfig } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

const isProtectedRoute = createRouteMatcher([
  '/chat(.*)',
  '/admin(.*)',
  '/api/conversations(.*)',
  '/api/chat(.*)',
  '/api/export(.*)',
  '/api/documents(.*)',
  '/api/admin(.*)',
  '/api/voice-rag(.*)',
])

const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL('/chat', req.url))
  }

  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  if (isAdminRoute(req) && userId) {
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/chat', req.url))
    }
  }
})

export const config: ProxyConfig = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    // Clerk webhook must pass through unauthenticated
    '/api/webhooks/(.*)',
    // Lawyers directory is public GET — still need Clerk session data available
    '/api/lawyers(.*)',
    '/',
  ],
}

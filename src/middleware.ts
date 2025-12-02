import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isRouteAllowed, getRankHome } from '@/rank/manifest'
import { readSessionCookie } from '@/fuse/hydration/session/cookie'
import type { UserRank } from '@/rank/types'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/landing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot(.*)',
  '/api/webhooks/(.*)'
])

// SOVEREIGN ROUTER: Domain routes that should render via FuseApp
const isDomainRoute = createRouteMatcher([
  '/admin(.*)',
  '/clients(.*)',
  '/finance(.*)',
  '/productivity(.*)',
  '/projects(.*)',
  '/settings(.*)',
  '/system(.*)'
])

// Define admin realm routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)'
])

// SRS: Soft mode flag (SRS_ENFORCE=0 observes, =1 enforces)
// NOTE: This only runs on INITIAL PAGE LOAD - Sovereign Router's navigate() bypasses middleware
const SRS_ENFORCE = process.env.SRS_ENFORCE === '1'

// NOTE: Admiral-only route protection is handled at Convex query level
// Middleware redirect removed to prevent hydration issues
// Security is enforced by requireAdmiral() in Convex queries

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname

  // KILL SWITCH: Check if admin realm is enabled
  if (isAdminRoute(req)) {
    const adminRealmEnabled = process.env.ENABLE_ADMIN_REALM === 'true'

    if (!adminRealmEnabled) {
      console.warn('⚠️ Admin realm access blocked: ENABLE_ADMIN_REALM=false')
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // FUSE OPTIMIZATION: Read session cookie ONCE (replaces Clerk auth.protect() network call)
  // Following FUSE Doctrine: "Clerk handshake and then no more Clerk - EVER!"
  const session = await readSessionCookie()

  // Protect non-public routes - redirect to sign-in if no valid FUSE session
  if (!isPublicRoute(req) && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    if (!session) {
      console.log('[FUSE Auth] No session cookie - redirecting to sign-in')
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  // SRS ENTRY GATE: Initial load authorization (Soft Mode)
  // NOTE: This is NOT "Layer 3" - Sovereign Router only has 2 layers:
  //   Layer 1: Rank Manifests (compile-time allowlists)
  //   Layer 2: Convex Data Scoping (query-level filtering)
  // This middleware is the ENTRY GATE - only runs on initial page load/refresh
  // Client-side navigate() bypasses this entirely - security via Convex queries

  if (session && !isPublicRoute(req) && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const effectiveRank: UserRank = session.rank as UserRank
    const actualRank: UserRank = session.rank as UserRank
    const orgId = '' // TODO: Add orgId to SessionPayload when multi-tenant ready

    // Check allowlist
    const allowed = isRouteAllowed(effectiveRank, pathname)

    if (!allowed) {
      if (SRS_ENFORCE) {
        // Hard mode: redirect to rank home
        const home = getRankHome(effectiveRank)
        console.log(`[SRS] Denied: ${effectiveRank} → ${pathname} (redirect → ${home})`)
        return NextResponse.redirect(new URL(home, req.url))
      } else {
        // Soft mode: log only, allow through
        console.log(`[SRS] Would block: ${effectiveRank} → ${pathname}`)
      }
    }

    // SOVEREIGN ROUTER: Rewrite domain routes to root (/) so FuseApp handles them
    // URL in browser stays as /admin/users but Next.js renders /page.tsx
    const res = isDomainRoute(req)
      ? NextResponse.rewrite(new URL('/', req.url))
      : NextResponse.next()

    // Stamp headers for RSC consumption
    res.headers.set('x-effective-rank', effectiveRank)
    res.headers.set('x-actual-rank', actualRank)
    res.headers.set('x-org-id', orgId)
    res.headers.set('x-theme-name', session.themeName || 'transtheme')
    res.headers.set('x-theme-mode', session.themeMode || 'light')
    res.headers.set('Vary', 'Cookie')
    return res
  }

  // For public routes, still set default theme headers
  // SOVEREIGN ROUTER: Rewrite domain routes to root (/) so FuseApp handles them
  const res = isDomainRoute(req)
    ? NextResponse.rewrite(new URL('/', req.url))
    : NextResponse.next()
  res.headers.set('x-theme-name', session?.themeName || 'transtheme')
  res.headers.set('x-theme-mode', session?.themeMode || 'light')
  res.headers.set('Vary', 'Cookie')
  return res
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

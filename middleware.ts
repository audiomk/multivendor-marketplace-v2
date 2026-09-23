import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Strip a locale prefix only if it's actually one of the configured locale
// codes (e.g. "/en-US/account" -> "/account"). The default locale
// (localePrefix: 'as-needed') is served with NO prefix at all, so a naive
// "first 2-3 letters look like a locale" regex would eat into route names
// themselves — e.g. "/account" -> "ount", "/admin" -> "in", "/vendor" ->
// "dor" — none of which match the startsWith() checks below, silently
// disabling every route guard in this file for default-locale requests.
export function stripLocalePrefix(pathname: string): string {
  const [, first, ...rest] = pathname.split('/')
  if ((routing.locales as readonly string[]).includes(first)) {
    return rest.length > 0 ? '/' + rest.join('/') : '/'
  }
  return pathname
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const strippedPath = stripLocalePrefix(pathname)

  // 1. Instantly skip token fetching for non-protected paths to reduce Edge processing overhead
  const isProtected =
    strippedPath.startsWith('/vendor') ||
    strippedPath.startsWith('/account') ||
    strippedPath.startsWith('/admin')

  if (!isProtected) {
    return intlMiddleware(req)
  }

  // 2. getToken() needs the secret passed explicitly here — the Edge
  // middleware runtime doesn't reliably auto-detect AUTH_SECRET from env.
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const user = token as any

  // Not logged in trying to access protected areas
  if (!token) {
    const url = new URL('/sign-in', req.url)
    return NextResponse.redirect(url)
  }

  // Non-admin trying to access the admin dashboard
  if (
    strippedPath.startsWith('/admin') &&
    user?.role !== 'admin' &&
    user?.role !== 'Admin'
  ) {
    const url = new URL('/', req.url)
    return NextResponse.redirect(url)
  }

  // Buyer trying to access vendor dashboard
  if (
    user?.role === 'User' &&
    strippedPath.startsWith('/vendor') &&
    !strippedPath.startsWith('/vendor/pending')
  ) {
    const url = new URL('/become-vendor', req.url)
    return NextResponse.redirect(url)
  }

  // Unapproved vendor — redirect to pending
  if (
    user?.role === 'vendor' &&
    !user?.vendorProfile?.isApproved &&
    strippedPath.startsWith('/vendor') &&
    !strippedPath.startsWith('/vendor/pending')
  ) {
    const url = new URL('/vendor/pending', req.url)
    return NextResponse.redirect(url)
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: [
    // Matches app pages only — anything under /api, /_next, or with a
    // file extension (icons, robots.txt, sitemap.xml, sw.js, offline.html,
    // manifest.webmanifest, etc.) is skipped. This is deliberately broad:
    // we kept discovering static/generated files one at a time that
    // next-intl was 404ing by trying to treat them as locale-prefixed
    // pages (sitemap.xml, then manifest.webmanifest, then /icons/*.png).
    // Matching "has a file extension" instead of enumerating filenames
    // means the next one doesn't need a middleware change to work.
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
}
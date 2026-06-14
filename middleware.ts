import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  })

  const user = token as any

  // Strip locale prefix to check path
  const strippedPath = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '')

  // Not logged in trying to access protected areas
  if (!token && (
    strippedPath.startsWith('/vendor') ||
    strippedPath.startsWith('/account')
  )) {
    const url = new URL('/sign-in', req.url)
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

  // Unapproved vendor — only redirect if NOT already on pending page
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
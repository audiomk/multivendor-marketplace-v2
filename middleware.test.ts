import { describe, it, expect } from 'vitest'
import { stripLocalePrefix, isHttpsRequest } from './middleware'

// Regression test for the production admin lockout: getToken() assumes a
// non-secure cookie unless told otherwise, but on https Auth.js names the
// session cookie "__Secure-authjs.session-token" — so signed-in admins
// were read as logged-out. Protocol detection must follow the proxy header.
describe('isHttpsRequest', () => {
  it('detects https from the request URL', () => {
    expect(isHttpsRequest('https://example.com/admin', null)).toBe(true)
    expect(isHttpsRequest('http://localhost:3000/admin', null)).toBe(false)
  })

  it('trusts x-forwarded-proto over the URL (TLS terminated at a proxy)', () => {
    expect(isHttpsRequest('http://internal-host/admin', 'https')).toBe(true)
    expect(isHttpsRequest('https://example.com/admin', 'http')).toBe(false)
  })

  it('uses the first value when the header has a proxy chain', () => {
    expect(isHttpsRequest('http://internal-host/admin', 'https, http')).toBe(true)
  })
})

// Regression test for a real bug: the original regex treated the first
// 2-3 letters of ANY path as a possible locale code, which silently
// defeated every route guard (/admin, /account, /vendor) for default-
// locale requests — e.g. "/account" was stripped down to "ount", which
// then failed every startsWith() check in middleware.ts.
describe('stripLocalePrefix', () => {
  it('leaves default-locale routes untouched, even when they look like a locale code', () => {
    expect(stripLocalePrefix('/account')).toBe('/account')
    expect(stripLocalePrefix('/admin')).toBe('/admin')
    expect(stripLocalePrefix('/vendor')).toBe('/vendor')
    expect(stripLocalePrefix('/admin/vendors')).toBe('/admin/vendors')
  })

  it('strips a real locale prefix', () => {
    expect(stripLocalePrefix('/en-US/account')).toBe('/account')
    expect(stripLocalePrefix('/fr/vendor')).toBe('/vendor')
    expect(stripLocalePrefix('/ar/admin/orders')).toBe('/admin/orders')
  })

  it('reduces a bare locale segment to the root path', () => {
    expect(stripLocalePrefix('/fr')).toBe('/')
    expect(stripLocalePrefix('/en-US')).toBe('/')
  })

  it('leaves the root path alone', () => {
    expect(stripLocalePrefix('/')).toBe('/')
  })
})

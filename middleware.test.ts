import { describe, it, expect } from 'vitest'
import { stripLocalePrefix } from './middleware'

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

import { describe, it, expect } from 'vitest'
import { buildProductJsonLd } from './structured-data'

const base = {
  name: 'Test Sneakers',
  description: 'Comfy shoes',
  images: ['https://example.com/a.jpg'],
  brand: 'Nike',
  slug: 'test-sneakers',
  price: 24.99,
  countInStock: 5,
  avgRating: 4.3,
  numReviews: 12,
  siteUrl: 'https://indabacart.co.zw',
}

describe('buildProductJsonLd', () => {
  it('marks the offer InStock when countInStock > 0', () => {
    const schema = buildProductJsonLd(base) as any
    expect(schema.offers.availability).toBe('https://schema.org/InStock')
  })

  it('marks the offer OutOfStock when countInStock is 0', () => {
    const schema = buildProductJsonLd({ ...base, countInStock: 0 }) as any
    expect(schema.offers.availability).toBe('https://schema.org/OutOfStock')
  })

  it('includes aggregateRating only when there are reviews', () => {
    const withReviews = buildProductJsonLd(base) as any
    expect(withReviews.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: '4.3',
      reviewCount: 12,
    })

    const withoutReviews = buildProductJsonLd({ ...base, numReviews: 0 }) as any
    expect(withoutReviews.aggregateRating).toBeUndefined()
  })

  it('builds a correct absolute offer URL', () => {
    const schema = buildProductJsonLd(base) as any
    expect(schema.offers.url).toBe('https://indabacart.co.zw/product/test-sneakers')
  })
})

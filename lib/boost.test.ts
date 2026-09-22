import { describe, it, expect } from 'vitest'
import { calculateBoostPrice, BOOST_TIERS } from './boost'

describe('calculateBoostPrice', () => {
  it('charges exactly the per-week price for a 7-day boost', () => {
    expect(calculateBoostPrice('featured', 7)).toBe(BOOST_TIERS.featured.pricePerWeek)
    expect(calculateBoostPrice('deal', 7)).toBe(BOOST_TIERS.deal.pricePerWeek)
    expect(calculateBoostPrice('spotlight', 7)).toBe(BOOST_TIERS.spotlight.pricePerWeek)
  })

  it('scales linearly with duration', () => {
    expect(calculateBoostPrice('featured', 14)).toBe(BOOST_TIERS.featured.pricePerWeek * 2)
    expect(calculateBoostPrice('featured', 30)).toBeCloseTo(BOOST_TIERS.featured.pricePerWeek * (30 / 7), 2)
  })

  it('spotlight is capped and the others are not', () => {
    expect(BOOST_TIERS.spotlight.maxSlots).not.toBeNull()
    expect(BOOST_TIERS.featured.maxSlots).toBeNull()
    expect(BOOST_TIERS.deal.maxSlots).toBeNull()
  })
})

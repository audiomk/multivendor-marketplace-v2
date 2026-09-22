export type BoostTier = 'featured' | 'deal' | 'spotlight'

export const BOOST_TIERS: Record<
  BoostTier,
  { label: string; description: string; pricePerWeek: number; maxSlots: number | null }
> = {
  featured: {
    label: 'Featured',
    description: 'Shows in the homepage "Featured" row',
    pricePerWeek: 3,
    maxSlots: null, // unlimited — it's a scrolling row
  },
  deal: {
    label: "Today's Deal",
    description: 'Shows in the homepage "Today\'s Deals" row',
    pricePerWeek: 5,
    maxSlots: null,
  },
  spotlight: {
    label: 'Spotlight',
    description: 'Premium homepage placement — limited slots',
    pricePerWeek: 12,
    maxSlots: 5, // scarcity is the point — keeps this tier worth paying for
  },
}

export const BOOST_DURATIONS_DAYS = [7, 14, 30] as const

export function calculateBoostPrice(tier: BoostTier, durationDays: number): number {
  const weeks = durationDays / 7
  return Math.round(BOOST_TIERS[tier].pricePerWeek * weeks * 100) / 100
}

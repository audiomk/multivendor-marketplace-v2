// Builds schema.org JSON-LD objects for rich search results (price/rating
// stars on Product pages, sitelinks search box on the homepage).

export function buildProductJsonLd({
  name,
  description,
  images,
  brand,
  slug,
  price,
  countInStock,
  avgRating,
  numReviews,
  siteUrl,
}: {
  name: string
  description: string
  images: string[]
  brand: string
  slug: string
  price: number
  countInStock: number
  avgRating: number
  numReviews: number
  siteUrl: string
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: images,
    brand: { '@type': 'Brand', name: brand },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${slug}`,
      priceCurrency: 'USD',
      price: price.toFixed(2),
      availability: countInStock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  if (numReviews > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: numReviews,
    }
  }

  return schema
}

export function buildWebsiteJsonLd(siteUrl: string, siteName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

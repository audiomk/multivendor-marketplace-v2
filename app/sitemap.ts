import { MetadataRoute } from 'next'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import WebPage from '@/lib/db/models/web-page.model'
import User from '@/lib/db/models/user.model'

export const revalidate = 3600 // regenerate at most once an hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  await connectToDatabase()

  const [products, webPages, vendors] = await Promise.all([
    Product.find({ isPublished: true }).select('slug updatedAt').limit(5000).lean(),
    WebPage.find({ isPublished: true }).select('slug updatedAt').lean(),
    User.find({ role: 'vendor', 'vendorProfile.isApproved': true, 'vendorProfile.storeSlug': { $ne: '' } })
      .select('vendorProfile.storeSlug updatedAt')
      .lean(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, changeFrequency: 'daily', priority: 0.8 },
  ]

  const productRoutes: MetadataRoute.Sitemap = (products as any[]).map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const webPageRoutes: MetadataRoute.Sitemap = (webPages as any[]).map((p) => ({
    url: `${baseUrl}/page/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.3,
  }))

  const storeRoutes: MetadataRoute.Sitemap = (vendors as any[]).map((v) => ({
    url: `${baseUrl}/store/${v.vendorProfile.storeSlug}`,
    lastModified: v.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...productRoutes, ...webPageRoutes, ...storeRoutes]
}

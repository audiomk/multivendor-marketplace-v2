import { NextRequest, NextResponse } from 'next/server'
import Product from '@/lib/db/models/product.model'
import { connectToDatabase } from '@/lib/db'

export const GET = async (request: NextRequest) => {
  const listType        = request.nextUrl.searchParams.get('type') || 'history'
  const productIdsParam = request.nextUrl.searchParams.get('ids')
  const categoriesParam = request.nextUrl.searchParams.get('categories')
  const excludeId       = request.nextUrl.searchParams.get('excludeId') || ''

  if (!productIdsParam || !categoriesParam) {
    return NextResponse.json([])
  }

  const productIds = productIdsParam.split(',').filter(Boolean)
  const categories = categoriesParam.split(',').filter(Boolean)

  await connectToDatabase()

  let products: any[] = []

  switch (listType) {
    case 'history':
      products = await Product.find({ _id: { $in: productIds } }).limit(12)
      products = products.sort(
        (a: any, b: any) =>
          productIds.indexOf(a._id.toString()) -
          productIds.indexOf(b._id.toString())
      )
      break

    case 'related':
      products = await Product.find({
        category: { $in: categories },
        _id:      { $nin: [...productIds, excludeId].filter(Boolean) },
        isPublished: true,
      }).limit(12)
      break

    case 'trending':
      // Best selling products in your recent categories
      products = await Product.find({
        category: { $in: categories },
        _id:      { $nin: productIds },
        isPublished: true,
      })
        .sort({ numSales: -1, avgRating: -1 })
        .limit(12)
      break

    case 'also-bought':
      // High rated products in same categories — simulates "also bought"
      products = await Product.find({
        category: { $in: categories },
        _id:      { $nin: productIds },
        isPublished: true,
        avgRating:   { $gte: 4 },
      })
        .sort({ numReviews: -1 })
        .limit(12)
      break

    default:
      products = []
  }

  return NextResponse.json(products)
}
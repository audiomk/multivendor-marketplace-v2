import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  if (q.length < 2) return NextResponse.json([])

  await connectToDatabase()

  const products = await Product.find({
    isPublished: true,
    name: { $regex: q, $options: 'i' },
  })
    .select('name')
    .limit(8)
    .lean()

  // Deduplicate and return just names
  const suggestions = [...new Set(products.map((p: any) => p.name))]

  return NextResponse.json(suggestions)
}
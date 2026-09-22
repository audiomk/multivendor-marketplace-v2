'use server'

import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import Product from '@/lib/db/models/product.model'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'

async function requireUserId() {
  const session = await auth()
  if (!session?.user) throw new Error('Not logged in')
  return (session.user as any).id as string
}

export async function toggleWishlist(productId: string) {
  try {
    const userId = await requireUserId()
    await connectToDatabase()

    const user = await User.findById(userId).select('wishlist').lean() as any
    const inWishlist = (user?.wishlist || []).some((id: any) => id.toString() === productId)

    if (inWishlist) {
      await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } })
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: productId } })
    }

    revalidatePath('/account/wishlist')
    return { success: true, inWishlist: !inWishlist }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Used to render filled/outline hearts across product cards without an
// extra round-trip per card.
export async function getMyWishlistIds(): Promise<string[]> {
  const session = await auth()
  if (!session?.user) return []
  await connectToDatabase()
  const user = await User.findById((session.user as any).id).select('wishlist').lean() as any
  return (user?.wishlist || []).map((id: any) => id.toString())
}

export async function getMyWishlist() {
  try {
    const userId = await requireUserId()
    await connectToDatabase()
    const user = await User.findById(userId).select('wishlist').lean() as any
    const productIds = user?.wishlist || []
    const products = await Product.find({ _id: { $in: productIds }, isPublished: true })
      .populate('vendorId', 'vendorProfile verification')
      .lean()
    return { success: true, data: JSON.parse(JSON.stringify(products)) }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

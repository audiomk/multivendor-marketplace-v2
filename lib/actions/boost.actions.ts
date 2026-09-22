/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { connectToDatabase } from '@/lib/db'
import Boost from '@/lib/db/models/boost.model'
import Product from '@/lib/db/models/product.model'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { checkAdmin } from './auth-guards'
import { BOOST_TIERS, BoostTier, calculateBoostPrice } from '../boost'

async function requireSession() {
  const session = await auth()
  if (!session?.user) throw new Error('Not logged in')
  return { userId: (session.user as any).id as string }
}

// How many spotlight boosts are currently live (paid + not yet expired).
// Spotlight is capped — scarcity is what makes it worth paying more for.
export async function getActiveSpotlightCount() {
  await connectToDatabase()
  return Boost.countDocuments({
    tier: 'spotlight',
    paymentStatus: 'paid',
    expiresAt: { $gt: new Date() },
  })
}

export async function requestBoost({
  productId,
  tier,
  durationDays,
}: {
  productId: string
  tier: BoostTier
  durationDays: number
}) {
  try {
    const { userId } = await requireSession()
    await connectToDatabase()

    const product = await Product.findOne({ _id: productId, vendorId: userId }).lean()
    if (!product) throw new Error('Product not found, or it isn’t yours')

    if (!BOOST_TIERS[tier]) throw new Error('Invalid boost tier')

    const maxSlots = BOOST_TIERS[tier].maxSlots
    if (maxSlots !== null) {
      const activeCount = await Boost.countDocuments({
        tier,
        paymentStatus: 'paid',
        expiresAt: { $gt: new Date() },
      })
      if (activeCount >= maxSlots) {
        throw new Error(`All ${maxSlots} ${BOOST_TIERS[tier].label} slots are taken right now — try again later or pick another tier`)
      }
    }

    const price = calculateBoostPrice(tier, durationDays)
    const boost = await Boost.create({
      productId,
      vendorId: userId,
      tier,
      durationDays,
      price,
      paymentStatus: 'pending',
    })

    revalidatePath('/vendor/boost')
    return { success: true, message: 'Boost requested', data: { boostId: boost._id.toString(), price } }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Vendor confirms they've paid (e.g. EcoCash reference) — doesn't activate
// the boost by itself, an admin still confirms the payment, same as order
// payments.
export async function submitBoostPaymentReference({
  boostId,
  method,
  reference,
}: {
  boostId: string
  method: string
  reference: string
}) {
  try {
    const { userId } = await requireSession()
    if (!reference.trim()) throw new Error('A payment reference is required')
    await connectToDatabase()

    const boost = await Boost.findOne({ _id: boostId, vendorId: userId })
    if (!boost) throw new Error('Boost request not found')
    if (boost.paymentStatus !== 'pending') throw new Error('This boost is no longer pending')

    boost.paymentMethod = method
    boost.paymentReference = reference.trim()
    await boost.save()

    revalidatePath('/vendor/boost')
    return { success: true, message: 'Payment reference submitted — waiting for confirmation' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getMyBoosts() {
  try {
    const { userId } = await requireSession()
    await connectToDatabase()
    const boosts = await Boost.find({ vendorId: userId })
      .populate('productId', 'name slug images')
      .sort({ createdAt: -1 })
      .lean()
    return { success: true, data: JSON.parse(JSON.stringify(boosts)) }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// ---- Admin ----

export async function getAllBoosts() {
  try {
    await checkAdmin()
    await connectToDatabase()
    const boosts = await Boost.find()
      .populate('productId', 'name slug')
      .populate('vendorId', 'name email vendorProfile')
      .sort({ createdAt: -1 })
      .lean()
    return { success: true, data: JSON.parse(JSON.stringify(boosts)) }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function confirmBoostPayment(boostId: string) {
  try {
    await checkAdmin()
    await connectToDatabase()

    const boost = await Boost.findById(boostId)
    if (!boost) throw new Error('Boost not found')
    if (boost.paymentStatus === 'paid') throw new Error('Already confirmed')

    const maxSlots = BOOST_TIERS[boost.tier].maxSlots
    if (maxSlots !== null) {
      const activeCount = await Boost.countDocuments({
        tier: boost.tier,
        paymentStatus: 'paid',
        expiresAt: { $gt: new Date() },
      })
      if (activeCount >= maxSlots) {
        throw new Error(`All ${maxSlots} ${BOOST_TIERS[boost.tier].label} slots are already taken`)
      }
    }

    const startsAt = new Date()
    const expiresAt = new Date(startsAt.getTime() + boost.durationDays * 24 * 60 * 60 * 1000)

    boost.paymentStatus = 'paid'
    boost.startsAt = startsAt
    boost.expiresAt = expiresAt
    await boost.save()

    await Product.findByIdAndUpdate(boost.productId, {
      boostTier: boost.tier,
      boostedUntil: expiresAt,
    })

    revalidatePath('/admin/boosts')
    revalidatePath('/')
    return { success: true, message: 'Boost activated' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function revokeBoost(boostId: string) {
  try {
    await checkAdmin()
    await connectToDatabase()

    const boost = await Boost.findById(boostId)
    if (!boost) throw new Error('Boost not found')

    boost.paymentStatus = 'cancelled'
    boost.expiresAt = new Date()
    await boost.save()

    await Product.findOneAndUpdate(
      { _id: boost.productId, boostTier: boost.tier },
      { boostTier: null, boostedUntil: null }
    )

    revalidatePath('/admin/boosts')
    revalidatePath('/')
    return { success: true, message: 'Boost revoked' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// ---- Homepage ----

export async function getBoostedProducts({
  tier,
  limit,
}: {
  tier: BoostTier
  limit: number
}) {
  await connectToDatabase()
  const products = await Product.find({
    boostTier: tier,
    boostedUntil: { $gt: new Date() },
    isPublished: true,
  })
    .sort({ boostedUntil: 1 }) // soonest-expiring first — fair rotation
    .limit(limit)
    .lean()
  return JSON.parse(JSON.stringify(products))
}

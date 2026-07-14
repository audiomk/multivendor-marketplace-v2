'use server'

import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'

async function requireUser() {
  const session = await auth()
  if (!session?.user) throw new Error('Not logged in')
  return (session.user as any).id as string
}

// --- Vendor submits ID ---
export async function submitIdVerification({
  idFrontUrl,
  idBackUrl,
}: {
  idFrontUrl: string
  idBackUrl:  string
}) {
  try {
    const userId = await requireUser()
    await connectToDatabase()
    await User.findByIdAndUpdate(userId, {
      'verification.idFrontUrl':    idFrontUrl,
      'verification.idBackUrl':     idBackUrl,
      'verification.idStatus':      'pending',
      'verification.idSubmittedAt': new Date(),
    })
    revalidatePath('/vendor/verification')
    return { success: true, message: 'ID submitted for review' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// --- Vendor submits tax clearance ---
export async function submitTaxVerification({
  taxDocUrl,
  taxExpiryDate,
}: {
  taxDocUrl:     string
  taxExpiryDate: string
}) {
  try {
    const userId = await requireUser()
    await connectToDatabase()
    await User.findByIdAndUpdate(userId, {
      'verification.taxDocUrl':      taxDocUrl,
      'verification.taxExpiryDate':  new Date(taxExpiryDate),
      'verification.taxStatus':      'pending',
      'verification.taxSubmittedAt': new Date(),
    })
    revalidatePath('/vendor/verification')
    return { success: true, message: 'Tax document submitted for review' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// --- Vendor submits selfie ---
export async function submitSelfieVerification({
  selfieUrl,
}: {
  selfieUrl: string
}) {
  try {
    const userId = await requireUser()
    await connectToDatabase()
    await User.findByIdAndUpdate(userId, {
      'verification.selfieUrl':        selfieUrl,
      'verification.selfieStatus':     'pending',
      'verification.selfieSubmittedAt': new Date(),
    })
    revalidatePath('/vendor/verification')
    return { success: true, message: 'Selfie submitted for review' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// --- Buyer submits ID ---
export async function submitBuyerIdVerification({
  idFrontUrl,
}: {
  idFrontUrl: string
}) {
  try {
    const userId = await requireUser()
    await connectToDatabase()
    await User.findByIdAndUpdate(userId, {
      'verification.idFrontUrl':    idFrontUrl,
      'verification.idStatus':      'pending',
      'verification.idSubmittedAt': new Date(),
    })
    revalidatePath('/account')
    return { success: true, message: 'ID submitted for review' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// --- Get current user verification status ---
export async function getMyVerification() {
  try {
    const userId = await requireUser()
    await connectToDatabase()
    const user = await User.findById(userId)
      .select('verification')
      .lean() as any
    return { success: true, data: user?.verification || null }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// --- Admin approves/rejects ---
export async function adminReviewVerification({
  userId,
  type,
  status,
  rejectReason = '',
}: {
  userId:        string
  type:          'id' | 'tax' | 'selfie'
  status:        'approved' | 'rejected'
  rejectReason?: string
}) {
  try {
    await connectToDatabase()
    const update: any = {
      [`verification.${type}Status`]:     status,
      [`verification.${type}ReviewedAt`]: new Date(),
    }
    if (status === 'rejected') {
      update[`verification.${type}RejectReason`] = rejectReason
    }

    await User.findByIdAndUpdate(userId, update)

    // Check if all three are approved → mark as fully verified
    const user = await User.findById(userId)
      .select('verification')
      .lean() as any
    const v = user?.verification
    if (
      v?.idStatus     === 'approved' &&
      v?.taxStatus    === 'approved' &&
      v?.selfieStatus === 'approved'
    ) {
      await User.findByIdAndUpdate(userId, {
        'verification.isVerified': true,
      })
    }

    revalidatePath('/admin/verifications')
    return { success: true, message: `${type} ${status}` }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
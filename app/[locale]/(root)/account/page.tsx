import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { Card, CardContent } from '@/components/ui/card'
import {
  Home, PackageCheckIcon, User,
  ShieldCheck, Store, BadgeCheck
} from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import UserModel from '@/lib/db/models/user.model'

const PAGE_TITLE = 'Your Account'
export const metadata: Metadata = { title: PAGE_TITLE }

export default async function AccountPage() {
  const session = await auth()
  const userId  = (session?.user as any)?.id
  const role    = (session?.user as any)?.role
  const isVendor = role === 'vendor'
  const isAdmin  = role === 'Admin' || role === 'admin'

  // Fetch verification status
  await connectToDatabase()
  const dbUser = await UserModel.findById(userId)
    .select('verification vendorProfile')
    .lean() as any

  const verification   = dbUser?.verification
  const isVerified     = verification?.isVerified === true
  const idVerified     = verification?.idStatus === 'approved'
  const vendorApproved = dbUser?.vendorProfile?.isApproved === true
  const storeName      = dbUser?.vendorProfile?.storeName
  const storeSlug      = dbUser?.vendorProfile?.storeSlug

  return (
    <div>
      {/* Header with verified badge */}
      <div className='flex items-center gap-3 py-4'>
        <h1 className='h1-bold'>{PAGE_TITLE}</h1>
        {isVerified && (
          <span className='flex items-center gap-1 bg-green-100 text-green-700
                           text-xs font-bold px-3 py-1 rounded-full border
                           border-green-300'>
            <BadgeCheck size={14} /> Verified
          </span>
        )}
        {isVendor && vendorApproved && (
          <span className='flex items-center gap-1 bg-[#006D6B]/10
                           text-[#006D6B] text-xs font-bold px-3 py-1
                           rounded-full border border-[#006D6B]/30'>
            <Store size={14} /> Vendor
          </span>
        )}
        {isAdmin && (
          <span className='flex items-center gap-1 bg-purple-100 text-purple-700
                           text-xs font-bold px-3 py-1 rounded-full border
                           border-purple-300'>
            Admin
          </span>
        )}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4
                      items-stretch'>
        {/* Orders */}
        <Card>
          <Link href='/account/orders'>
            <CardContent className='flex items-start gap-4 p-6'>
              <PackageCheckIcon className='w-12 h-12 shrink-0' />
              <div>
                <h2 className='text-xl font-bold'>Orders</h2>
                <p className='text-muted-foreground text-sm'>
                  Track, return, cancel an order or buy again
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Login & Security */}
        <Card>
          <Link href='/account/manage'>
            <CardContent className='flex items-start gap-4 p-6'>
              <User className='w-12 h-12 shrink-0' />
              <div>
                <h2 className='text-xl font-bold'>Login & Security</h2>
                <p className='text-muted-foreground text-sm'>
                  Manage password, email and mobile number
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Addresses */}
        <Card>
          <Link href='/account/addresses'>
            <CardContent className='flex items-start gap-4 p-6'>
              <Home className='w-12 h-12 shrink-0' />
              <div>
                <h2 className='text-xl font-bold'>Addresses</h2>
                <p className='text-muted-foreground text-sm'>
                  Edit, remove or set default address
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Verify Identity */}
        <Card className={isVerified ? 'border-green-300' : ''}>
          <Link href='/account/verification'>
            <CardContent className='flex items-start gap-4 p-6'>
              <ShieldCheck className={`w-12 h-12 shrink-0 ${
                isVerified ? 'text-green-600' : ''
              }`} />
              <div>
                <div className='flex items-center gap-2'>
                  <h2 className='text-xl font-bold'>Verify Identity</h2>
                  {isVerified && (
                    <BadgeCheck size={16} className='text-green-600' />
                  )}
                </div>
                <p className='text-muted-foreground text-sm'>
                  {isVerified
                    ? 'Your identity is verified ✓'
                    : 'Upload ID to verify your account'
                  }
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Vendor Dashboard — only for approved vendors */}
        {isVendor && vendorApproved && (
          <Card className='border-[#006D6B]/40 bg-[#006D6B]/5'>
            <Link href='/vendor/overview'>
              <CardContent className='flex items-start gap-4 p-6'>
                <Store className='w-12 h-12 shrink-0 text-[#006D6B]' />
                <div>
                  <h2 className='text-xl font-bold text-[#006D6B]'>
                    Vendor Dashboard
                  </h2>
                  <p className='text-muted-foreground text-sm'>
                    {storeName || 'Your Store'} — manage products,
                    orders & earnings
                  </p>
                  {storeSlug && (
                    <p className='text-xs text-[#006D6B] mt-1'>
                      /store/{storeSlug}
                    </p>
                  )}
                </div>
              </CardContent>
            </Link>
          </Card>
        )}

        {/* Become a vendor — only for regular buyers */}
        {role === 'User' && (
          <Card className='border-dashed'>
            <Link href='/become-vendor'>
              <CardContent className='flex items-start gap-4 p-6'>
                <Store className='w-12 h-12 shrink-0 text-muted-foreground' />
                <div>
                  <h2 className='text-xl font-bold'>Sell on Indaba Cart</h2>
                  <p className='text-muted-foreground text-sm'>
                    Open your store and reach thousands of customers
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>
        )}

        {/* Vendor pending — unapproved vendors */}
        {isVendor && !vendorApproved && (
          <Card className='border-yellow-300 bg-yellow-50'>
            <Link href='/vendor/pending'>
              <CardContent className='flex items-start gap-4 p-6'>
                <Store className='w-12 h-12 shrink-0 text-yellow-600' />
                <div>
                  <h2 className='text-xl font-bold text-yellow-700'>
                    Application Pending
                  </h2>
                  <p className='text-muted-foreground text-sm'>
                    Your vendor application is under review
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>
        )}

        {/* Admin panel link */}
        {isAdmin && (
          <Card className='border-purple-300 bg-purple-50'>
            <Link href='/admin/overview'>
              <CardContent className='flex items-start gap-4 p-6'>
                <ShieldCheck className='w-12 h-12 shrink-0 text-purple-600' />
                <div>
                  <h2 className='text-xl font-bold text-purple-700'>
                    Admin Dashboard
                  </h2>
                  <p className='text-muted-foreground text-sm'>
                    Manage vendors, orders and platform settings
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>
        )}
      </div>

      <BrowsingHistoryList className='mt-16' />
    </div>
  )
}
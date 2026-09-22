import { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/auth'
import { getAllVendors, approveVendor, rejectVendor, suspendVendor } from '@/lib/actions/admin.actions'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import VendorActions from './vendor-actions'
import WhatsAppVerifyButton from './whatsapp-verify-button'

export const metadata: Metadata = { title: 'Manage Vendors' }

export default async function AdminVendorsPage() {
  const session = await auth()
const role = session?.user?.role
if (role !== 'Admin' && role !== 'admin')
  throw new Error('Admin permission required')

  const result = await getAllVendors()
  if (!result.success) return <p className='text-red-500'>{result.message}</p>

  const vendors   = result.data!
  // Vendors are approved to sell the instant they apply — isApproved only
  // goes false when an admin suspends the account.
  const suspended = vendors.filter((v: any) => !v.vendorProfile?.isApproved)
  const active    = vendors.filter((v: any) =>  v.vendorProfile?.isApproved)

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Vendor Management</h1>
      <p className='text-sm text-muted-foreground mb-6'>
        New vendors can sell immediately — no manual approval needed. Use{' '}
        <Link href='/admin/verifications' className='underline'>Verifications</Link>{' '}
        to review ID/tax documents and grant the trusted-seller badge.
      </p>

      {/* Suspended */}
      {suspended.length > 0 && (
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-3 text-red-600'>
            🚫 Suspended ({suspended.length})
          </h2>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suspended.map((v: any) => (
                  <TableRow key={v._id}>
                    <TableCell>
                      <p className='font-medium'>{v.name}</p>
                      <p className='text-xs text-muted-foreground'>{v.email}</p>
                    </TableCell>
                    <TableCell>
                      <p>{v.vendorProfile?.storeName}</p>
                      <p className='text-xs text-muted-foreground'>
                        /{v.vendorProfile?.storeSlug}
                      </p>
                    </TableCell>
                    <TableCell>
                      <VendorActions id={v._id} type='suspended' />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Active */}
      <div>
        <h2 className='text-lg font-semibold mb-3 text-green-600'>
          ✓ Active Vendors ({active.length})
        </h2>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {active.map((v: any) => (
                <TableRow key={v._id}>
                  <TableCell>
                    <p className='font-medium'>{v.name}</p>
                    <p className='text-xs text-muted-foreground'>{v.email}</p>
                  </TableCell>
                  <TableCell>
                    <p>{v.vendorProfile?.storeName}</p>
                    <p className='text-xs text-muted-foreground'>
                      /{v.vendorProfile?.storeSlug}
                    </p>
                  </TableCell>
                  <TableCell>
                    {v.verification?.isVerified ? (
                      <span className='text-xs text-green-600 font-medium'>
                        ✓ Verified
                      </span>
                    ) : (
                      <span className='text-xs text-muted-foreground'>
                        Not verified
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {v.vendorProfile?.whatsappNumber ? (
                      <div className='space-y-1'>
                        <p className='text-xs font-mono'>{v.vendorProfile.whatsappNumber}</p>
                        {v.vendorProfile.whatsappVerified ? (
                          <span className='text-xs text-green-600 font-medium block'>✓ Verified</span>
                        ) : (
                          <span className='text-xs text-yellow-600 font-medium block'>Pending</span>
                        )}
                        <WhatsAppVerifyButton
                          vendorId={v._id}
                          verified={!!v.vendorProfile.whatsappVerified}
                        />
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground'>Not provided</span>
                    )}
                  </TableCell>
                  <TableCell>{v.vendorProfile?.commission}%</TableCell>
                  <TableCell>
                    {v.vendorProfile?.stripeAccountId ? (
                      <span className='text-xs text-green-600 font-medium'>
                        Connected
                      </span>
                    ) : (
                      <span className='text-xs text-red-400'>
                        Not connected
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <VendorActions id={v._id} type='active' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
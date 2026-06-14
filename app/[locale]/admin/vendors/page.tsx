import { Metadata } from 'next'
import { auth } from '@/auth'
import { getAllVendors, approveVendor, rejectVendor, suspendVendor } from '@/lib/actions/admin.actions'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import VendorActions from './vendor-actions'

export const metadata: Metadata = { title: 'Manage Vendors' }

export default async function AdminVendorsPage() {
  const session = await auth()
const role = session?.user?.role
if (role !== 'Admin' && role !== 'admin')
  throw new Error('Admin permission required')

  const result = await getAllVendors()
  if (!result.success) return <p className='text-red-500'>{result.message}</p>

  const vendors = result.data!
  const pending  = vendors.filter((v: any) => !v.vendorProfile?.isApproved)
  const approved = vendors.filter((v: any) =>  v.vendorProfile?.isApproved)

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Vendor Management</h1>

      {/* Pending */}
      {pending.length > 0 && (
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-3 text-yellow-600'>
            ⏳ Pending Approval ({pending.length})
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
                {pending.map((v: any) => (
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
                      <VendorActions id={v._id} type='pending' />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Approved */}
      <div>
        <h2 className='text-lg font-semibold mb-3 text-green-600'>
          ✓ Approved Vendors ({approved.length})
        </h2>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approved.map((v: any) => (
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
                    <VendorActions id={v._id} type='approved' />
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
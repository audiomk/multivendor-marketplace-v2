import { Metadata } from 'next'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import AdminVerificationActions from './admin-verification-actions'

export const metadata: Metadata = { title: 'Verifications' }

export default async function AdminVerificationsPage() {
  const session = await auth()
  const role    = (session?.user as any)?.role
  if (role !== 'Admin' && role !== 'admin') {
    throw new Error('Admin permission required')
  }

  await connectToDatabase()

  const users = await User.find({
    'verification.idStatus': { $in: ['pending', 'approved', 'rejected'] },
  })
    .select('name email role verification')
    .lean() as any[]

  const pending  = users.filter(u =>
    u.verification?.idStatus     === 'pending' ||
    u.verification?.taxStatus    === 'pending' ||
    u.verification?.selfieStatus === 'pending'
  )
  const approved = users.filter(u => u.verification?.isVerified)

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Verification Requests</h1>

      <div className='grid grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold text-yellow-600'>{pending.length}</p>
            <p className='text-sm text-muted-foreground'>Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold text-green-600'>{approved.length}</p>
            <p className='text-sm text-muted-foreground'>Fully Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>{users.length}</p>
            <p className='text-sm text-muted-foreground'>Total Submissions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Verification Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Selfie</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user._id}>
                  <TableCell>
                    <p className='font-medium text-sm'>{user.name}</p>
                    <p className='text-xs text-muted-foreground'>{user.email}</p>
                  </TableCell>
                  <TableCell>
                    <span className='text-xs capitalize'>{user.role}</span>
                  </TableCell>
                  <TableCell>
                    <StatusPill status={user.verification?.idStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusPill status={user.verification?.taxStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusPill status={user.verification?.selfieStatus} />
                  </TableCell>
                  <TableCell>
                    {user.verification?.isVerified
                      ? <span className='text-green-600 text-xs font-bold'>✓ Yes</span>
                      : <span className='text-gray-400 text-xs'>No</span>
                    }
                  </TableCell>
                  <TableCell>
                    <AdminVerificationActions
                      userId={user._id.toString()}
                      verification={user.verification}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusPill({ status }: { status?: string }) {
  const color =
    status === 'approved' ? 'bg-green-100 text-green-700' :
    status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
    status === 'rejected' ? 'bg-red-100 text-red-700' :
    'bg-gray-100 text-gray-500'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {status || 'none'}
    </span>
  )
}
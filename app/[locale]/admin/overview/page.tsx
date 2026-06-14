import { Metadata } from 'next'
import OverviewReport from './overview-report'
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

const DashboardPage = async () => {
  const session = await auth()
  const role = session?.user.role
  if (role !== 'Admin' && role !== 'admin')
    throw new Error('Admin permission required')
  return <OverviewReport />
}

export default DashboardPage
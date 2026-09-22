import { auth } from '@/auth'

export async function checkAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (role !== 'admin' && role !== 'Admin') {
    throw new Error('Unauthorized')
  }
  return session
}

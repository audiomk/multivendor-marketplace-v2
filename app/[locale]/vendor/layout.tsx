import Image from 'next/image'
import NextLink from 'next/link'
import React from 'react'
import Menu from '@/components/shared/header/menu'
import { VendorNav } from './vendor-nav'
import { getSetting } from '@/lib/actions/setting.actions'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const user = session?.user as any

  if (!session) redirect('/sign-in')
  if (user?.role === 'User') redirect('/become-vendor')
  if (user?.role === 'vendor' && !user?.vendorProfile?.isApproved) {
    redirect('/vendor/pending')
  }

  const { site } = await getSetting()

  return (
    <div className='flex flex-col'>
      <div className='bg-black text-white'>
        <div className='flex h-16 items-center px-2'>
          <NextLink href='/en-US'>
            <Image
              src='/icons/logo.svg'
              width={48}
              height={48}
              alt={`${site.name} logo`}
            />
          </NextLink>
          <VendorNav className='mx-6 hidden md:flex' />
          <div className='ml-auto flex items-center space-x-4'>
            <Menu />
          </div>
        </div>
        <div>
          <VendorNav className='flex md:hidden px-4 pb-2' />
        </div>
      </div>
      <div className='flex-1 p-4'>{children}</div>
    </div>
  )
}
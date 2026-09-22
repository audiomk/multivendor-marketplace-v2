import { auth } from '@/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOut } from '@/lib/actions/user.actions'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, UserRound } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function UserButton() {
  const t       = await getTranslations()
  const session = await auth()
  const role    = (session?.user as any)?.role
  const hasVendorProfile = (session?.user as any)?.vendorProfile?.storeName

  const isAdmin  = role === 'Admin' || role === 'admin'
  const isVendor = role === 'vendor' || (isAdmin && hasVendorProfile)
  const firstName = session?.user?.name?.split(' ')[0]

  return (
    <div className='flex gap-2 items-center'>
      <DropdownMenu>
        <DropdownMenuTrigger
          className='header-button flex items-center gap-1.5 !p-2 rounded-full
                     border border-white/25 hover:border-white/50 transition-colors'
          asChild
        >
          <div className='flex items-center gap-1.5'>
            <UserRound className='h-4 w-4' />
            <span className='text-sm font-medium'>
              {firstName || t('Header.Sign in')}
            </span>
            <ChevronDownIcon className='h-3.5 w-3.5' />
          </div>
        </DropdownMenuTrigger>
        {session ? (
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {session.user.name}
                </p>
                <p className='text-xs leading-none text-muted-foreground'>
                  {session.user.email}
                </p>
                {isVendor && (
                  <p className='text-xs text-[#006D6B] font-medium'>
                    Vendor Account
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <Link className='w-full' href='/account'>
                <DropdownMenuItem>{t('Header.Your account')}</DropdownMenuItem>
              </Link>
              <Link className='w-full' href='/account/orders'>
                <DropdownMenuItem>{t('Header.Your orders')}</DropdownMenuItem>
              </Link>
              {isVendor && (
                <Link className='w-full' href='/vendor/overview'>
                  <DropdownMenuItem>Vendor Dashboard</DropdownMenuItem>
                </Link>
              )}
              {isAdmin && (
                <Link className='w-full' href='/admin/overview'>
                  <DropdownMenuItem>{t('Header.Admin')}</DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>
            <DropdownMenuItem className='p-0 mb-1'>
              <form action={SignOut} className='w-full'>
                <Button
                  className='w-full py-4 px-2 h-4 justify-start'
                  variant='ghost'
                >
                  {t('Header.Sign out')}
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  className={cn(buttonVariants(), 'w-full')}
                  href='/sign-in'
                >
                  {t('Header.Sign in')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className='font-normal'>
                {t('Header.New Customer')}?{' '}
                <Link href='/sign-up'>{t('Header.Sign up')}</Link>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  )
}
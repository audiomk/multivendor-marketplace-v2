'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/utils'

const links = [
  { title: 'Overview',  href: '/vendor/overview' },
  { title: 'Products',  href: '/vendor/products' },
  { title: 'Orders',    href: '/vendor/orders' },
  { title: 'Earnings',  href: '/vendor/earnings' },
  { title: 'Settings',  href: '/vendor/settings' },
]

export function VendorNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'flex items-center flex-wrap overflow-hidden gap-2 md:gap-4',
        className
      )}
      {...props}
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            '',
            pathname.includes(item.href) ? '' : 'text-muted-foreground'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
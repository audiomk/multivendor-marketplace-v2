import React from 'react'
import Link from 'next/link'

// 1. Defined the navigation items (including your new link)
const navItems = [
  { title: 'Verify Identity', href: '/account/verification' },
  // You can easily add more links here in the future
]

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col md:flex-row min-h-screen max-w-6xl mx-auto p-4 gap-6'>
      
      {/* 2. Sidebar Navigation */}
      <aside className='w-full md:w-64 flex-shrink-0'>
        <nav className='flex md:flex-col gap-2 p-2 bg-slate-50 rounded-lg dark:bg-zinc-950'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='px-4 py-2 text-sm font-medium rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors'
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>

      {/* 3. Main Content Area */}
      <main className='flex-1 space-y-4'>
        {children}
      </main>
      
    </div>
  )
}
// import Image from 'next/image'
// import Link from 'next/link'
// import { getAllCategories } from '@/lib/actions/product.actions'
// import Menu from './menu'
// import Search from './search'
// import data from '@/lib/data'
// import Sidebar from './sidebar'
// import { getSetting } from '@/lib/actions/setting.actions'
// import { getTranslations } from 'next-intl/server'

// export default async function Header() {
//   const categories  = await getAllCategories()
//   const { site }    = await getSetting()
//   const t           = await getTranslations()

//   return (
//     <header className='text-white' style={{ background: '#006D6B' }}>
//       <div className='px-2'>
//         <div className='flex items-center gap-2'>
//           {/* Logo */}
//           <Link
//             href='/'
//             className='flex items-center header-button font-extrabold text-2xl m-1 shrink-0'
//           >
//             <Image
//               src={site.logo}
//               width={40}
//               height={40}
//               alt={`${site.name} logo`}
//               className='mr-2'
//             />
//             <span style={{ color: '#FABB02' }}>Indaba</span>
//             <span className='text-white ml-1'>Cart</span>
//           </Link>

//           {/* Search — desktop */}
//           <div className='hidden md:flex flex-1 max-w-2xl'>
//             <Search
//               categories={categories}
//               siteName={site.name}
//               placeholder={t('Header.Search Site', { name: site.name })}
//               allLabel={t('Header.All')}
//             />
//           </div>

//           <Menu />
//         </div>

//         {/* Search — mobile */}
//         <div className='md:hidden py-2'>
//           <Search
//             categories={categories}
//             siteName={site.name}
//             placeholder={t('Header.Search Site', { name: site.name })}
//             allLabel={t('Header.All')}
//           />
//         </div>
//       </div>

//       {/* Sub nav */}
//       <div
//         className='flex items-center px-3 mb-[1px]'
//         style={{ background: '#005554' }}
//       >
//         <Sidebar categories={categories} />
//         <div className='flex items-center flex-wrap gap-3 overflow-hidden max-h-[42px]'>
//           {data.headerMenus.map((menu) => (
//             <Link
//               href={menu.href}
//               key={menu.href}
//               className='header-button !p-2 hover:text-[#FABB02] transition-colors'
//             >
//               {t('Header.' + menu.name)}
//             </Link>
//           ))}
//         </div>
//       </div>
//     </header>
//   )
// }

import Image from 'next/image'
import Link from 'next/link'
import { Bell, Camera, Heart, HelpCircle, Store } from 'lucide-react'
import { auth } from '@/auth'
import { getAllCategories } from '@/lib/actions/product.actions'
import Menu from './menu'
import Search from './search'
import data from '@/lib/data'
import Sidebar from './sidebar'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations } from 'next-intl/server'

export default async function Header() {
  const session     = await auth()
  const categories  = await getAllCategories()
  const { site }    = await getSetting()
  const t           = await getTranslations()

  const firstName = session?.user?.name?.split(' ')[0]

  return (
    <header>
      {/* Utility bar */}
      <div
        className='hidden sm:flex items-center justify-between px-4 py-1 text-xs text-white/85'
        style={{ background: '#004E4C' }}
      >
        <span>
          {firstName && (
            <>Hi, <span className='font-semibold text-white'>{firstName}</span></>
          )}
        </span>
        <div className='flex items-center gap-4 ml-auto'>
          <Link
            href='/become-vendor'
            className='flex items-center gap-1 hover:text-[#FABB02] transition-colors'
          >
            <Store className='w-3.5 h-3.5' />
            Become a Vendor
          </Link>
          <Link
            href='/page/help'
            className='flex items-center gap-1 hover:text-[#FABB02] transition-colors'
          >
            <HelpCircle className='w-3.5 h-3.5' />
            Help
          </Link>
        </div>
      </div>

      {/* Main bar — inverted: white bg, teal lettering, logo through cart */}
      <div className='px-2 bg-white text-[#006D6B] border-b border-gray-100'>
        <div className='flex items-center gap-2'>
          {/* Logo */}
          <Link
            href='/'
            className='flex items-center header-button font-extrabold text-2xl m-1 shrink-0 tracking-tight'
          >
            <Image
              src={site.logo}
              width={40}
              height={40}
              alt={`${site.name} logo`}
              className='mr-2'
            />
            <span style={{ color: '#FABB02' }}>Indaba</span>
            <span className='text-[#006D6B] ml-1'>Cart</span>
          </Link>

          {/* Search — desktop */}
          <div className='hidden md:flex flex-1 max-w-2xl'>
            <div className='relative w-full rounded-full border border-gray-200 focus-within:border-[#FABB02] focus-within:ring-2 focus-within:ring-[#FABB02]/40 transition-all'>
              <Search
                categories={categories}
                siteName={site.name}
                placeholder={t('Header.Search Site', { name: site.name })}
                allLabel={t('Header.All')}
              />
              <button
                type='button'
                aria-label='Search by image'
                title='Visual search — coming soon'
                className='absolute right-[52px] top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-[#006D6B] hover:bg-gray-100 transition-colors'
              >
                <Camera className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Notifications + Wishlist */}
          <div className='hidden sm:flex items-center gap-1 text-[#006D6B]'>
            <Link
              href='/account/notifications'
              aria-label='Notifications'
              className='header-button relative p-2 hover:text-[#FABB02] transition-colors'
            >
              <Bell className='w-6 h-6' />
            </Link>
            <Link
              href='/account/wishlist'
              aria-label='Wishlist'
              className='header-button p-2 hover:text-[#FABB02] transition-colors'
            >
              <Heart className='w-6 h-6' />
            </Link>
          </div>

          <div className='text-[#006D6B]'>
            <Menu />
          </div>
        </div>

        {/* Search — mobile */}
        <div className='md:hidden py-2'>
          <div className='relative w-full rounded-full border border-gray-200 focus-within:border-[#FABB02] focus-within:ring-2 focus-within:ring-[#FABB02]/40 transition-all'>
            <Search
              categories={categories}
              siteName={site.name}
              placeholder={t('Header.Search Site', { name: site.name })}
              allLabel={t('Header.All')}
            />
            <button
              type='button'
              aria-label='Search by image'
              title='Visual search — coming soon'
              className='absolute right-[52px] top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-[#006D6B] hover:bg-gray-100 transition-colors'
            >
              <Camera className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Gold seam */}
      <div
        className='h-[3px] w-full'
        style={{ background: 'linear-gradient(90deg, #FABB02 0%, #FFD65C 50%, #FABB02 100%)' }}
      />

      {/* Sub nav — unchanged, still teal */}
      <div
        className='flex items-center px-3 text-white shadow-[0_2px_6px_rgba(0,0,0,0.15)]'
        style={{ background: '#00504E' }}
      >
        <Sidebar categories={categories} />
        <div className='flex items-center flex-wrap gap-1 overflow-hidden max-h-[42px]'>
          {data.headerMenus.map((menu) => (
            <Link
              href={menu.href}
              key={menu.href}
              className='header-button !p-2 relative text-white/90 hover:text-white transition-colors
                         after:content-[""] after:absolute after:left-2 after:right-2 after:bottom-1
                         after:h-[2px] after:bg-[#FABB02] after:scale-x-0 hover:after:scale-x-100
                         after:origin-left after:transition-transform after:duration-200'
            >
              {t('Header.' + menu.name)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
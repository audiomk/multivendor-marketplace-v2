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
import { getAllCategories } from '@/lib/actions/product.actions'
import Menu from './menu'
import Search from './search'
import data from '@/lib/data'
import Sidebar from './sidebar'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations } from 'next-intl/server'

export default async function Header() {
  const categories  = await getAllCategories()
  const { site }    = await getSetting()
  const t           = await getTranslations()

  return (
    <header className='text-white'>
      <div
        className='px-2'
        style={{
          background: 'linear-gradient(180deg, #00847F 0%, #006D6B 60%, #005B59 100%)',
        }}
      >
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
            <span className='text-white ml-1'>Cart</span>
          </Link>

          {/* Search — desktop */}
          <div className='hidden md:flex flex-1 max-w-2xl'>
            <div className='w-full rounded-full ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-[#FABB02] transition-shadow'>
              <Search
                categories={categories}
                siteName={site.name}
                placeholder={t('Header.Search Site', { name: site.name })}
                allLabel={t('Header.All')}
              />
            </div>
          </div>

          <Menu />
        </div>

        {/* Search — mobile */}
        <div className='md:hidden py-2'>
          <div className='w-full rounded-full ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-[#FABB02] transition-shadow'>
            <Search
              categories={categories}
              siteName={site.name}
              placeholder={t('Header.Search Site', { name: site.name })}
              allLabel={t('Header.All')}
            />
          </div>
        </div>
      </div>

      {/* Gold seam — signature accent separating brand bar from sub-nav */}
      <div
        className='h-[3px] w-full'
        style={{ background: 'linear-gradient(90deg, #FABB02 0%, #FFD65C 50%, #FABB02 100%)' }}
      />

      {/* Sub nav */}
      <div
        className='flex items-center px-3 shadow-[0_2px_6px_rgba(0,0,0,0.15)]'
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
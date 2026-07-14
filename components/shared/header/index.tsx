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
    <header className='text-white' style={{ background: '#006D6B' }}>
      <div className='px-2'>
        <div className='flex items-center gap-2'>
          {/* Logo */}
          <Link
            href='/'
            className='flex items-center header-button font-extrabold text-2xl m-1 shrink-0'
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
            <Search
              categories={categories}
              siteName={site.name}
              placeholder={t('Header.Search Site', { name: site.name })}
              allLabel={t('Header.All')}
            />
          </div>

          <Menu />
        </div>

        {/* Search — mobile */}
        <div className='md:hidden py-2'>
          <Search
            categories={categories}
            siteName={site.name}
            placeholder={t('Header.Search Site', { name: site.name })}
            allLabel={t('Header.All')}
          />
        </div>
      </div>

      {/* Sub nav */}
      <div
        className='flex items-center px-3 mb-[1px]'
        style={{ background: '#005554' }}
      >
        <Sidebar categories={categories} />
        <div className='flex items-center flex-wrap gap-3 overflow-hidden max-h-[42px]'>
          {data.headerMenus.map((menu) => (
            <Link
              href={menu.href}
              key={menu.href}
              className='header-button !p-2 hover:text-[#FABB02] transition-colors'
            >
              {t('Header.' + menu.name)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
import Image from 'next/image'
import Link from 'next/link'
import {
  Bell, Camera, Flame, HelpCircle, Heart, History,
  Info, Sparkles, Star, Store, Trophy,
} from 'lucide-react'
import { auth } from '@/auth'
import { getAllCategories } from '@/lib/actions/product.actions'
import Menu from './menu'
import Search from './search'
import data from '@/lib/data'
import Sidebar from './sidebar'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations } from 'next-intl/server'

// One icon per header-menu item, matched by name — falls back to Sparkles.
const MENU_ICONS: Record<string, typeof Flame> = {
  "Today's Deal": Flame,
  'New Arrivals': Sparkles,
  'Featured Products': Star,
  'Best Sellers': Trophy,
  'Browsing History': History,
  'Customer Service': HelpCircle,
  'About Us': Info,
}

export default async function Header() {
  const session     = await auth()
  const categories  = await getAllCategories()
  const { site }    = await getSetting()
  const t           = await getTranslations()

  const firstName = session?.user?.name?.split(' ')[0]

  return (
    <header className='relative'>
      {/* Colour band — curved bottom edge, not a flat rectangle */}
      <div
        className='relative pb-9 rounded-b-[28px] overflow-hidden'
        style={{ background: 'linear-gradient(135deg, #00807D 0%, #004E4C 100%)' }}
      >
        {/* faint decorative rings — texture instead of a flat fill */}
        <div
          className='pointer-events-none absolute -right-10 -top-16 w-56 h-56 rounded-full'
          style={{ background: 'radial-gradient(circle, rgba(250,187,2,0.12) 0%, transparent 70%)' }}
        />
        <div
          className='pointer-events-none absolute right-24 top-6 w-24 h-24 rounded-full border border-white/10'
        />

        {/* Utility line */}
        <div className='hidden sm:flex items-center justify-end gap-4 px-4 pt-2 text-xs text-white/70 relative'>
          {firstName && (
            <span className='mr-auto'>
              Hi, <span className='font-semibold text-white'>{firstName}</span>
            </span>
          )}
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

        {/* Logo + icon cluster — no search bar in this row */}
        <div className='flex items-center justify-between gap-3 px-4 pt-3 relative'>
          <Link href='/' className='flex items-center gap-2 shrink-0'>
            <span className='relative flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-white/15 ring-1 ring-white/25'>
              <Image
                src={site.logo}
                width={22}
                height={22}
                alt={`${site.name} logo`}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </span>
            <span className='leading-none'>
              <span className='block font-extrabold text-2xl tracking-tight text-white'>
                Indaba<span style={{ color: '#FABB02' }}>Cart</span>
              </span>
              <span className='hidden sm:block text-[11px] text-white/60 tracking-wide'>
                An Indaba Worth Having
              </span>
            </span>
          </Link>

          <div className='flex items-center gap-0.5 text-white shrink-0'>
            <Link
              href='/account/notifications'
              aria-label='Notifications'
              className='header-button relative p-2 hover:text-[#FABB02] transition-colors'
            >
              <Bell className='w-5 h-5' />
            </Link>
            <Link
              href='/account/wishlist'
              aria-label='Wishlist'
              className='header-button p-2 hover:text-[#FABB02] transition-colors'
            >
              <Heart className='w-5 h-5' />
            </Link>
            <Menu />
          </div>
        </div>
      </div>

      {/* Floating search — breaks out of the band into the page below */}
      <div className='px-4 -mt-6 relative z-10'>
        <div className='max-w-3xl mx-auto md:mx-0 relative rounded-full bg-card shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-border focus-within:ring-2 focus-within:ring-[#FABB02]/50 transition-all'>
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
            className='absolute right-[44px] top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-[#006D6B] hover:bg-muted transition-colors'
          >
            <Camera className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Category rail — icon chips, not flat text links */}
      <div className='flex items-center gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        <Sidebar categories={categories} />
        {data.headerMenus.map((menu) => {
          const Icon = MENU_ICONS[menu.name] || Sparkles
          return (
            <Link
              href={menu.href}
              key={menu.href}
              className='flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-sm
                         text-muted-foreground border border-border hover:border-[#006D6B]
                         hover:text-[#006D6B] transition-colors whitespace-nowrap'
            >
              <Icon className='w-3.5 h-3.5' />
              {t('Header.' + menu.name)}
            </Link>
          )
        })}
      </div>
    </header>
  )
}

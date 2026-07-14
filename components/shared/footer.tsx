'use client'
import { ChevronUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import useSettingStore from '@/hooks/use-setting-store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { i18n } from '@/i18n-config'

const footerLinks = [
  {
    title: 'Shop',
    links: [
      { label: "Today's Deals",  href: '/search?tag=todays-deal' },
      { label: 'New Arrivals',   href: '/search?tag=new-arrival' },
      { label: 'Best Sellers',   href: '/search?tag=best-seller' },
      { label: 'All Products',   href: '/search' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My Account',     href: '/account' },
      { label: 'My Orders',      href: '/account/orders' },
      { label: 'Sign In',        href: '/sign-in' },
      { label: 'Register',       href: '/sign-up' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Become a Vendor',  href: '/become-vendor' },
      { label: 'Vendor Dashboard', href: '/vendor/overview' },
      { label: 'Vendor Products',  href: '/vendor/products' },
      { label: 'Vendor Orders',    href: '/vendor/orders' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Help Centre',      href: '/page/help' },
      { label: 'Returns Policy',   href: '/page/returns-policy' },
      { label: 'Shipping Info',    href: '/page/shipping' },
      { label: 'Privacy Policy',   href: '/page/privacy-policy' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us',         href: '/page/about-us' },
      { label: 'Careers',          href: '/page/careers' },
      { label: 'Blog',             href: '/page/blog' },
      { label: 'Advertise',        href: '/page/advertise' },
    ],
  },
]

export default function Footer() {
  const router   = useRouter()
  const pathname = usePathname()
  const {
    setting: { site, availableCurrencies, currency },
    setCurrency,
  } = useSettingStore()
  const { locales } = i18n
  const locale = useLocale()
  const t      = useTranslations()

  return (
    <footer className='text-white' style={{ background: '#1a1a1a' }}>
      {/* Back to top */}
      <Button
        variant='ghost'
        className='w-full rounded-none py-3 text-sm hover:text-[#FABB02]'
        style={{ background: '#2a2a2a' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronUp className='mr-2 h-4 w-4' />
        Back to top
      </Button>

      {/* Main footer links */}
      <div className='max-w-7xl mx-auto px-4 py-10'>
        <div className='grid grid-cols-2 md:grid-cols-5 gap-8'>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className='font-bold text-white mb-4 text-sm uppercase
                             tracking-wider'>
                {section.title}
              </h3>
              <ul className='space-y-2'>
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className='text-gray-400 text-sm hover:text-[#FABB02]
                                 transition-colors'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className='mt-10 pt-8 border-t border-gray-800'>
          <p className='text-xs text-gray-500 mb-3 uppercase tracking-wider'>
            Accepted Payments
          </p>
          <div className='flex items-center gap-3 flex-wrap'>
            {['VISA', 'PayPal', 'Stripe', 'EcoCash'].map((method) => (
              <span
                key={method}
                className='bg-white text-black text-xs font-bold
                           px-3 py-1.5 rounded'
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ background: '#006D6B' }}>
        <div className='max-w-7xl mx-auto px-4 py-4 flex flex-col
                        md:flex-row items-center justify-between gap-4'>
          {/* Logo + name */}
          <div className='flex items-center gap-3'>
            <Image
              src='/icons/logo.svg'
              alt={site.name}
              width={36}
              height={36}
            />
            <span className='font-extrabold text-lg'>
              <span style={{ color: '#FABB02' }}>Indaba</span>
              <span className='text-white ml-1'>Cart</span>
            </span>
          </div>

          {/* Language + Currency */}
          <div className='flex items-center gap-3'>
           <Select
  value={locale}
  onValueChange={(value) => {
    window.location.href = `/${value === 'en-US' ? '' : value}`
  }}
>
              <SelectTrigger className='w-36 bg-white/10 border-white/20
                                        text-white text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales.map((lang, i) => (
                  <SelectItem key={i} value={lang.code}>
                    <Link
                      className='flex items-center gap-1'
                      href={pathname}
                      locale={lang.code}
                    >
                      <span>{lang.icon}</span> {lang.name}
                    </Link>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currency}
              onValueChange={(val) => {
                setCurrency(val)
                window.scrollTo(0, 0)
              }}
            >
              <SelectTrigger className='w-28 bg-white/10 border-white/20
                                        text-white text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.filter((x) => x.code).map((c, i) => (
                  <SelectItem key={i} value={c.code}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Copyright */}
          <p className='text-white/70 text-xs text-center'>
            © {site.copyright} · {site.address}
          </p>
        </div>

        {/* Category links strip */}
        <div className='border-t border-white/20 py-3 px-4'>
          <div className='max-w-7xl mx-auto flex flex-wrap gap-x-3 gap-y-1
                          justify-center'>
            {['Smartphones', 'Laptops', 'Beauty', 'Fragrances', 'Groceries',
              'Furniture', 'Shoes', 'Watches', 'Bags', 'Sunglasses'].map((cat) => (
              <Link
                key={cat}
                href={`/search?category=${cat.toLowerCase()}`}
                className='text-white/60 text-xs hover:text-[#FABB02]
                           transition-colors'
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Legal links */}
        <div className='border-t border-white/20 py-3 px-4'>
          <div className='max-w-7xl mx-auto flex flex-wrap gap-x-4
                          justify-center text-xs text-white/50'>
            <Link href='/page/conditions-of-use'
              className='hover:text-white transition-colors'>
              Conditions of Use
            </Link>
            <Link href='/page/privacy-policy'
              className='hover:text-white transition-colors'>
              Privacy Notice
            </Link>
            <Link href='/page/help'
              className='hover:text-white transition-colors'>
              Help
            </Link>
            <Link href='/page/returns-policy'
              className='hover:text-white transition-colors'>
              Returns Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
export const i18n = {
  locales: [
    { code: 'en-US', name: 'English',  icon: '🇺🇸' },
    { code: 'fr',    name: 'Français', icon: '🇫🇷' },
    { code: 'ar',    name: 'العربية',  icon: '🇸🇦' },
    { code: 'nd-ZW', name: 'isiNdebele', icon: '🇿🇼' },
    { code: 'sn-ZW', name: 'ChiShona',  icon: '🇿🇼' },
  ],
  defaultLocale: 'en-US',
}

export const getDirection = (locale: string) => {
  return locale === 'ar' ? 'rtl' : 'ltr'
}
export type I18nConfig = typeof i18n
export type Locale = I18nConfig['locales'][number]

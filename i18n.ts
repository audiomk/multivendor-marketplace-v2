// /i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing'; // Use your existing routing config

export default getRequestConfig(async ({ requestLocale }) => {
  // This satisfies the runtime requirement for next-intl
  let locale = await requestLocale;
 
  // Ensure the locale is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
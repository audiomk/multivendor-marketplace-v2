import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Your existing list of supported locales
const locales = ['en-US', 'fr', 'ar', 'nd-ZW', 'sn-ZW'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
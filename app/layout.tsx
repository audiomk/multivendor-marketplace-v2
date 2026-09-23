import SentryClientInit from '@/components/shared/sentry-client-init'
import PwaInit from '@/components/shared/pwa-init'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SentryClientInit />
        <PwaInit />
        {children}
      </body>
    </html>
  )
}
import SentryClientInit from '@/components/shared/sentry-client-init'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SentryClientInit />
        {children}
      </body>
    </html>
  )
}
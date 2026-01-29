import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { getLocale } from 'next-intl/server'
import { AnalyticsLoader } from '@/components/analytics/analytics-loader'
import { ClientProviders } from '@/app/client-providers'
import { env } from '@/env.vercel'
import { type Locale } from '@/i18n/config'
import './globals.css'

const pretendard = localFont({
  src: [
    { path: '../public/fonts/Pretendard-Regular.woff2', weight: '100 400', style: 'normal' },
    { path: '../public/fonts/Pretendard-Bold.woff2', weight: '500 900', style: 'normal' },
  ],
  variable: '--font-pretendard',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
})

export const metadata: Metadata = {
  title: 'Goongoom',
  description: 'Ask anything and get honest answers.',
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
}

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E1306C' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = (await getLocale()) as Locale

  return (
    <html lang={locale} className={pretendard.variable} suppressHydrationWarning>
      <body className="bg-background font-sans antialiased">
        <ClientProviders initialLocale={locale}>{children}</ClientProviders>
        <AnalyticsLoader />
      </body>
    </html>
  )
}

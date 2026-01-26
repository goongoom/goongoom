import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { AnalyticsLoader } from '@/components/analytics/analytics-loader'
import { ClientProviders } from '@/app/client-providers'
import { clientEnv } from '@/env'
import { defaultLocale } from '@/i18n/config'
import './globals.css'

const lineSeedKR = localFont({
  src: [
    { path: '../public/fonts/LINESeedKR-Th.woff2', weight: '100' },
    { path: '../public/fonts/LINESeedKR-Rg.woff2', weight: '400' },
    { path: '../public/fonts/LINESeedKR-Bd.woff2', weight: '700' },
  ],
  variable: '--font-line-seed-kr',
  display: 'swap',
})

const lineSeedJP = localFont({
  src: [
    { path: '../public/fonts/LINESeedJP_OTF_Th.woff2', weight: '100' },
    { path: '../public/fonts/LINESeedJP_OTF_Rg.woff2', weight: '400' },
    { path: '../public/fonts/LINESeedJP_OTF_Bd.woff2', weight: '700' },
    { path: '../public/fonts/LINESeedJP_OTF_Eb.woff2', weight: '800' },
  ],
  variable: '--font-line-seed-jp',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Goongoom',
  description: 'Ask anything and get honest answers.',
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
}

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E1306C' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${lineSeedKR.variable} ${lineSeedJP.variable}`} lang={defaultLocale} suppressHydrationWarning>
      <body className="bg-background font-sans antialiased">
        <ClientProviders>{children}</ClientProviders>
        <AnalyticsLoader />
      </body>
    </html>
  )
}

import { enUS, jaJP, koKR } from '@clerk/localizations'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import localFont from 'next/font/local'
import { getTranslations } from 'next-intl/server'
import Script from 'next/script'
import { ConvexClientProvider } from '@/app/ConvexClientProvider'
import { Providers } from '@/components/providers'
import type { Locale } from '@/i18n/config'
import { getUserLocale } from '@/i18n/request'
import './globals.css'

const clerkLocalizations: Record<Locale, typeof koKR> = {
  ko: koKR,
  en: enUS,
  ja: jaJP,
}

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('og')
  return {
    title: t('appName'),
    description: t('siteDescription'),
  }
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
  const locale = await getUserLocale()

  // Read referral cookie server-side
  let signUpUnsafeMetadata: Record<string, string> | undefined
  try {
    const cookieStore = await cookies()
    const referralRaw = cookieStore.get('referral')?.value

    if (referralRaw) {
      const referralData = JSON.parse(decodeURIComponent(referralRaw))
      signUpUnsafeMetadata = {
        referrerUsername: referralData.u,
        utmSource: referralData.s,
        utmMedium: referralData.m,
        utmCampaign: referralData.c,
        utmTerm: referralData.t,
        utmContent: referralData.n,
      }
    }
  } catch (err) {
    console.warn('Failed to parse referral cookie:', err)
  }

  return (
    <ClerkProvider
      localization={clerkLocalizations[locale]}
      // @ts-ignore - signUpUnsafeMetadata is a custom prop for referral tracking
      signUpUnsafeMetadata={signUpUnsafeMetadata}
    >
      <html className={`${lineSeedKR.variable} ${lineSeedJP.variable}`} lang={locale} suppressHydrationWarning>
        <body className="bg-background font-sans antialiased">
          <ConvexClientProvider>
            <Providers initialLocale={locale}>{children}</Providers>
          </ConvexClientProvider>
          <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
          <Script src="/_vercel/speed-insights/script.js" strategy="afterInteractive" />
        </body>
      </html>
    </ClerkProvider>
  )
}

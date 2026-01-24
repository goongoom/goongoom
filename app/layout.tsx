import { enUS, koKR } from "@clerk/localizations"
import { ClerkProvider } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { EscapeInAppBrowser } from "eiab/react"
import type { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages, getTranslations } from "next-intl/server"
import { ThemeProvider } from "next-themes"
import { PasskeySetupModal } from "@/components/auth/passkey-setup-modal"
import { AppShellWrapper } from "@/components/layout/app-shell-wrapper"
import { NavigationProvider } from "@/components/navigation/navigation-provider"
import { PushNotificationProvider } from "@/components/notifications/push-provider"
import { AddToHomeScreenNudge } from "@/components/pwa/add-to-homescreen-nudge"
import { SignatureColorProvider } from "@/components/theme/signature-color-provider"
import { ThemeCookieSync } from "@/components/theme/theme-cookie-sync"
import { Toaster } from "@/components/ui/sonner"
import { getOrCreateUser } from "@/lib/db/queries"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const clerkLocalizations = {
  ko: koKR,
  en: enUS,
} as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#064e3b" },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [locale, messages, { userId }] = await Promise.all([
    getLocale(),
    getMessages(),
    auth(),
  ])
  const clerkLocalization =
    clerkLocalizations[locale as keyof typeof clerkLocalizations] || koKR

  const dbUser = userId ? await getOrCreateUser(userId) : null

  return (
    <ClerkProvider localization={clerkLocalization}>
      <html className={inter.variable} lang={locale} suppressHydrationWarning>
        <body className="bg-background font-sans antialiased">
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              disableTransitionOnChange
              enableSystem
            >
              <ThemeCookieSync />
              <SignatureColorProvider signatureColor={dbUser?.signatureColor}>
                <NavigationProvider />
                <EscapeInAppBrowser />
                <AppShellWrapper>
                  <main className="flex-1">{children}</main>
                </AppShellWrapper>
                <PasskeySetupModal />
                <AddToHomeScreenNudge />
                <PushNotificationProvider />
                <Toaster />
              </SignatureColorProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  )
}

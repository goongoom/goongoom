import { enUS, koKR } from "@clerk/localizations"
import { ClerkProvider } from "@clerk/nextjs"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { EscapeInAppBrowser } from "eiab/react"
import type { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { ThemeProvider } from "next-themes"
import { PasskeySetupModal } from "@/components/auth/passkey-setup-modal"
import { AppShellWrapper } from "@/components/layout/app-shell-wrapper"
import { NavigationProvider } from "@/components/navigation/navigation-provider"
import { PushNotificationProvider } from "@/components/notifications/push-provider"
import { AddToHomeScreenNudge } from "@/components/pwa/add-to-homescreen-nudge"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const clerkLocalizations = {
  ko: koKR,
  en: enUS,
} as const

export const metadata: Metadata = {
  title: "궁금닷컴",
  description: "궁금한 것을 물어보고 답변을 받아보세요",
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
  const locale = await getLocale()
  const messages = await getMessages()
  const clerkLocalization =
    clerkLocalizations[locale as keyof typeof clerkLocalizations] || koKR

  return (
    <html className={inter.variable} lang={locale} suppressHydrationWarning>
      <body className="bg-background font-sans antialiased">
        <ClerkProvider localization={clerkLocalization}>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              disableTransitionOnChange
              enableSystem
            >
              <NavigationProvider />
              <EscapeInAppBrowser />
              <AppShellWrapper>
                <main className="flex-1">{children}</main>
              </AppShellWrapper>
              <PasskeySetupModal />
              <AddToHomeScreenNudge />
              <PushNotificationProvider />
              <Toaster />
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

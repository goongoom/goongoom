import { enUS, koKR } from "@clerk/localizations"
import { ClerkProvider } from "@clerk/nextjs"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { ThemeProvider } from "next-themes"
import { PasskeySetupModal } from "@/components/auth/passkey-setup-modal"
import { GlobalNav } from "@/components/layout/global-nav"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const clerkLocalizations = {
  ko: koKR,
  en: enUS,
} as const

export const metadata: Metadata = {
  title: "궁금닷컴 - 익명 질문 답변 플랫폼",
  description: "궁금한 것을 물어보고 답변을 받아보세요",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
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
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-background font-sans antialiased">
        <ClerkProvider localization={clerkLocalization}>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              disableTransitionOnChange
              enableSystem
            >
              <GlobalNav />
              <main className="pt-16">{children}</main>
              <PasskeySetupModal />
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

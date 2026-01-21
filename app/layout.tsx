import { koKR } from "@clerk/localizations"
import { ClerkProvider } from "@clerk/nextjs"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata, Viewport } from "next"
import { ThemeProvider } from "next-themes"
import { PasskeySetupModal } from "@/components/auth/passkey-setup-modal"
import { GlobalNav } from "@/components/layout/global-nav"
import "./globals.css"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-background font-sans antialiased">
        <ClerkProvider localization={koKR}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <GlobalNav />
            {children}
            <PasskeySetupModal />
          </ThemeProvider>
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

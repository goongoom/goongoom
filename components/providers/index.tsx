'use client'

import { EscapeInAppBrowser } from 'eiab/react'
import { useTheme } from 'next-themes'
import { ThemeProvider } from 'next-themes'
import { useEffect, type ReactNode } from 'react'
import { PasskeySetupModal } from '@/components/auth/passkey-setup-modal'
import { AppShellWrapper } from '@/components/layout/app-shell-wrapper'
import { PushNotificationProvider } from '@/components/notifications/push-provider'
import { IntlProvider } from '@/components/providers/intl-provider'
import { UserProvider } from '@/components/providers/user-provider'
import { AddToHomeScreenNudge } from '@/components/pwa/add-to-homescreen-nudge'
import { Toaster } from '@/components/ui/sonner'
import { useSwipeBack } from '@/hooks/use-swipe-back'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Inline ThemeCookieSync effect
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    if (resolvedTheme) {
      document.cookie = `theme=${resolvedTheme};path=/;max-age=31536000;SameSite=Lax`
    }
  }, [resolvedTheme])

  // Inline NavigationProvider effects
  useEffect(() => {
    function handlePopState() {
      document.documentElement.dataset.navDirection = 'back'
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useSwipeBack()

  return (
    <IntlProvider>
      <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
        <UserProvider>
          <EscapeInAppBrowser />
          <AppShellWrapper>
            <main className="flex-1">{children}</main>
          </AppShellWrapper>
          <PasskeySetupModal />
          <AddToHomeScreenNudge />
          <PushNotificationProvider />
          <Toaster />
        </UserProvider>
      </ThemeProvider>
    </IntlProvider>
  )
}

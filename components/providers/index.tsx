'use client'

import { useUser } from '@clerk/nextjs'
import { EscapeInAppBrowser } from 'eiab/react'
import dynamic from 'next/dynamic'
import { ThemeProvider, useTheme } from 'next-themes'
import { useEffect, type ReactNode } from 'react'
import { AppShellWrapper } from '@/components/layout/app-shell-wrapper'
import { PrefetchManager } from '@/components/navigation/prefetch-manager'
import { UserProvider } from '@/components/providers/user-provider'
import { Toaster } from '@/components/ui/sonner'
import { useSwipeBack } from '@/hooks/use-swipe-back'

const PasskeySetupModal = dynamic(
  () => import('@/components/auth/passkey-setup-modal').then((mod) => mod.PasskeySetupModal),
  { ssr: false }
)
const AddToHomeScreenNudge = dynamic(
  () => import('@/components/pwa/add-to-homescreen-nudge').then((mod) => mod.AddToHomeScreenNudge),
  { ssr: false }
)
const PushNotificationProvider = dynamic(
  () => import('@/components/notifications/push-provider').then((mod) => mod.PushNotificationProvider),
  { ssr: false }
)

interface ProvidersProps {
  children: ReactNode
}

function AuthedOnly({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useUser()

  if (!isLoaded || !user) {
    return null
  }

  return <>{children}</>
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
    <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
      <PrefetchManager />
      <UserProvider>
        <EscapeInAppBrowser />
        <AppShellWrapper>
          <main className="flex-1">{children}</main>
        </AppShellWrapper>
        <AuthedOnly>
          <PasskeySetupModal />
          <PushNotificationProvider />
        </AuthedOnly>
        <AddToHomeScreenNudge />
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  )
}

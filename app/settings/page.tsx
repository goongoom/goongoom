'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { PasskeyNudge } from '@/components/auth/passkey-nudge'
import { MainContent } from '@/components/layout/main-content'
import { AboutSection } from '@/components/settings/about-section'
import { AccountSettingsButton } from '@/components/settings/account-settings-button'
import { LocaleSelector } from '@/components/settings/locale-selector'
import { LogoutButton } from '@/components/settings/logout-button'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { ThemeSelector } from '@/components/settings/theme-selector'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { ToastOnMount } from '@/components/ui/toast-on-mount'

export default function SettingsPage() {
  const { userId: clerkId } = useAuth()
  const { user, isLoaded: isUserLoaded } = useUser()
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const t = useTranslations('settings')

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthLoading, isAuthenticated, router])

  const error = searchParams.get('error') ? decodeURIComponent(searchParams.get('error')!) : null

  if (isAuthLoading || !isAuthenticated || !isUserLoaded) {
    return (
      <MainContent>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner className="size-8" />
        </div>
      </MainContent>
    )
  }

  if (!user) {
    return (
      <MainContent>
        <h1 className="mb-2 font-bold text-3xl text-foreground">{t('title')}</h1>
        <p className="mb-8 text-muted-foreground">{t('description')}</p>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('profileRequired')}</EmptyTitle>
            <EmptyDescription>{t('profileRequiredDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </MainContent>
    )
  }

  return (
    <MainContent>
      <div className="mb-8 space-y-2">
        <h1 className="font-bold text-3xl text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>

      {error && <ToastOnMount message={error} type="error" />}

      <div className="space-y-4">
        <AccountSettingsButton />

        <PasskeyNudge />

        <Card>
          <CardContent>
            <ThemeSelector />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <LocaleSelector />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {clerkId && <NotificationSettings clerkId={clerkId} />}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-0">
            <LogoutButton />
          </CardContent>
        </Card>

        <AboutSection />
      </div>
    </MainContent>
  )
}

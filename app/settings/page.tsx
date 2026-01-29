'use client'

import { useAuth, useClerk, useUser } from '@clerk/nextjs'
import { ArrowRight01Icon, Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useConvexAuth } from 'convex/react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import posthog from 'posthog-js'
import { PasskeyNudge } from '@/components/auth/passkey-nudge'
import { MainContent } from '@/components/layout/main-content'
import { AboutSection } from '@/components/settings/about-section'
import { LocaleSelector } from '@/components/settings/locale-selector'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { ThemeSelector } from '@/components/settings/theme-selector'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { ToastOnMount } from '@/components/ui/toast-on-mount'

export default function SettingsPage() {
  const { userId: clerkId } = useAuth()
  const { user, isLoaded: isUserLoaded } = useUser()
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
  const { openUserProfile, signOut } = useClerk()
  const searchParams = useSearchParams()

  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  const error = searchParams.get('error') ? decodeURIComponent(searchParams.get('error')!) : null

  if (isAuthLoading || !isAuthenticated || !isUserLoaded) {
    return (
      <MainContent>
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
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
        <button
          className="group flex w-full items-center gap-4 rounded-2xl bg-card p-5 text-left ring-1 ring-foreground/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
          onClick={() => {
            posthog.capture('user_profile_opened')
            openUserProfile()
          }}
          type="button"
        >
          <Avatar className="size-12 shrink-0 ring-2 ring-pink-500/20">
            {user?.imageUrl && <AvatarImage alt={user?.firstName || user?.username || '?'} src={user.imageUrl} />}
            <AvatarFallback className="bg-gradient-to-br from-pink-500/10 to-orange-500/10 font-semibold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              {(user?.firstName || user?.username || '?')[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">{user?.firstName || user?.username || '?'}</h3>
            <p className="truncate text-muted-foreground text-sm">{t('accountSettingsDescription')}</p>
          </div>
          <HugeiconsIcon
            className="size-5 shrink-0 text-muted-foreground transition-transform"
            icon={ArrowRight01Icon}
            strokeWidth={2}
          />
        </button>

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
          <CardContent>{clerkId && <NotificationSettings clerkId={clerkId} />}</CardContent>
        </Card>

        <Card>
          <CardContent className="py-0">
            <button
              className="group flex w-full items-center gap-3 rounded-xl py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => {
                posthog.capture('signout_clicked')
                signOut({ redirectUrl: '/' })
              }}
              type="button"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 transition-colors">
                <HugeiconsIcon
                  className="size-4 text-muted-foreground transition-colors"
                  icon={Logout01Icon}
                  strokeWidth={2}
                />
              </div>
              <span className="flex-1 font-medium text-muted-foreground text-sm transition-colors">
                {tCommon('logout')}
              </span>
              <HugeiconsIcon
                className="size-4 text-muted-foreground/50 transition-all"
                icon={ArrowRight01Icon}
                strokeWidth={2}
              />
            </button>
          </CardContent>
        </Card>

        <AboutSection />
      </div>
    </MainContent>
  )
}

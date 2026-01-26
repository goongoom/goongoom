'use client'

import { SignUpButton, useUser } from '@clerk/nextjs'
import {
  AnonymousIcon,
  Rocket01Icon,
  Share08Icon,
  UserMultiple02Icon,
  Megaphone01Icon,
  MessageQuestionIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from 'convex/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { HomeCTAButtons } from '@/components/home/home-cta-buttons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/convex/_generated/api'

const features = [
  { icon: AnonymousIcon, key: 'feature1' },
  { icon: Rocket01Icon, key: 'feature2' },
  { icon: Share08Icon, key: 'feature3' },
]

const useCases = [
  { icon: Megaphone01Icon, key: 'useCase1' },
  { icon: UserMultiple02Icon, key: 'useCase2' },
  { icon: MessageQuestionIcon, key: 'useCase3' },
]

export default function Home() {
  const t = useTranslations('landing')
  const tCommon = useTranslations('common')
  const tProfile = useTranslations('profile')
  const { user, isLoaded: isUserLoaded } = useUser()
  const router = useRouter()

  const answerCount = useQuery(api.answers.count, {})

  useEffect(() => {
    if (isUserLoaded && user?.username) {
      router.prefetch(`/${user.username}`)
      router.replace(`/${user.username}`)
    }
  }, [isUserLoaded, user, router])

  const isRedirecting = isUserLoaded && !!user?.username
  const isLoading = answerCount === undefined || isRedirecting

  if (isLoading) {
    return (
      <div className="flex flex-col bg-background">
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Skeleton className="mx-auto mb-6 h-6 w-48" />
              <Skeleton className="mx-auto h-12 w-72" />
              <Skeleton className="mx-auto mt-2 h-12 w-56" />
              <Skeleton className="mx-auto mt-6 h-5 w-full max-w-md" />
              <Skeleton className="mx-auto mt-2 h-5 w-80" />
              <div className="mt-10 flex justify-center gap-4">
                <Skeleton className="h-14 w-36 rounded-full" />
                <Skeleton className="h-14 w-24 rounded-full" />
              </div>
              <Skeleton className="mx-auto mt-8 h-5 w-48" />
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-4xl px-6">
            <Skeleton className="mx-auto mb-4 h-8 w-40" />
            <Skeleton className="mx-auto mb-12 h-5 w-64" />
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="relative rounded-2xl border bg-card p-6">
                  <Skeleton className="absolute -top-4 left-6 size-8 rounded-full" />
                  <Skeleton className="mt-4 h-6 w-28" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-background">
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-6">
              {t('badge')}
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t('heroTitle1')}
              <br />
              <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                {t('heroTitle2')}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('heroSubtitle')}
            </p>

            <div className="mt-10">
              <HomeCTAButtons
                startLabel={tCommon('start')}
                loginLabel={tCommon('login')}
                isLoggedIn={isUserLoaded && !!user}
                profileLabel={tProfile('myProfile')}
                profileUrl={user?.username ? `/${user.username}` : undefined}
              />
            </div>

            <p className="mt-8 text-sm text-muted-foreground">{t('trustIndicator', { count: answerCount })}</p>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16 dark:bg-muted/10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t('howItWorksTitle')}
            </h2>
            <p className="mt-3 text-muted-foreground">{t('howItWorksSubtitle')}</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="relative rounded-2xl border bg-card p-6">
              <div className="absolute -top-3 left-6 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">{t('step1Title')}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t('step1Description')}</p>
            </div>

            <div className="relative rounded-2xl border bg-card p-6">
              <div className="absolute -top-3 left-6 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">{t('step2Title')}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t('step2Description')}</p>
            </div>

            <div className="relative rounded-2xl border bg-card p-6">
              <div className="absolute -top-3 left-6 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">{t('step3Title')}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t('step3Description')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{t('featuresTitle')}</h2>
            <p className="mt-3 text-muted-foreground">{t('featuresSubtitle')}</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.key} className="rounded-2xl border bg-card p-6">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={feature.icon} className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{t(`${feature.key}Title`)}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{t(`${feature.key}Description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16 dark:bg-muted/10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {t('useCasesTitle')}
              </h2>
              <p className="mt-3 text-muted-foreground">{t('useCasesSubtitle')}</p>

              <div className="mt-8 space-y-5">
                {useCases.map((useCase) => (
                  <div key={useCase.key} className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <HugeiconsIcon icon={useCase.icon} className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{t(`${useCase.key}Title`)}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{t(`${useCase.key}Description`)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <SignUpButton mode="modal">
                  <Button size="lg" className="h-11 rounded-full px-6">
                    {t('ctaButton')}
                  </Button>
                </SignUpButton>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-pink-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-pink-500" />
                </span>
                {t('liveQuestions')}
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs">{tCommon('anonymous')}</span>
                  <span className="truncate text-foreground">{t('mockQuestion1')}</span>
                  <span className="ml-auto shrink-0 text-xs">{t('mockTimeNow')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs">{tCommon('anonymous')}</span>
                  <span className="truncate text-foreground">{t('mockQuestion2')}</span>
                  <span className="ml-auto shrink-0 text-xs">{t('mockTime2m')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="shrink-0 rounded bg-pink-100 px-1.5 py-0.5 text-xs text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                    {t('mockSenderName')}
                  </span>
                  <span className="truncate text-foreground">{t('mockQuestion3')}</span>
                  <span className="ml-auto shrink-0 text-xs">{t('mockTime5m')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs">{tCommon('anonymous')}</span>
                  <span className="truncate text-foreground">{t('mockQuestion4')}</span>
                  <span className="ml-auto shrink-0 text-xs">{t('mockTime8m')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-zinc-900 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{t('ctaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-md text-zinc-400">{t('ctaSubtitle')}</p>
          <div className="mt-8">
            <SignUpButton mode="modal">
              <Button size="lg" className="h-11 rounded-full bg-white px-6 text-zinc-900 hover:bg-zinc-100">
                {t('ctaButton')}
              </Button>
            </SignUpButton>
          </div>
        </div>
      </section>
    </div>
  )
}

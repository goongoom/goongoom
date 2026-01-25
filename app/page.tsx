'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { HomeCTAButtons } from '@/components/home/home-cta-buttons'
import { AnsweredQuestionCard } from '@/components/questions/answered-question-card'
import { CarouselItem } from '@/components/ui/carousel'
import { HomeCarousel } from '@/components/home/home-carousel'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'

type RecentAnswer = NonNullable<FunctionReturnType<typeof api.answers.getRecentLimitPerUser>>[number]

export default function Home() {
  const t = useTranslations('home')
  const tCommon = useTranslations('common')
  const tProfile = useTranslations('profile')
  const locale = useLocale()
  const { user, isLoaded: isUserLoaded } = useUser()
  const router = useRouter()

  const recentAnswers = useQuery(api.answers.getRecentLimitPerUser, {
    totalLimit: 30,
    perUserLimit: 2,
  })
  const answerCount = useQuery(api.answers.count, {})

  const cardLabels = useMemo(
    () => ({
      anonymous: tCommon('anonymous'),
      identified: tCommon('identified'),
    }),
    [tCommon]
  )

  useEffect(() => {
    if (isUserLoaded && user?.username) {
      router.replace(`/${user.username}`)
    }
  }, [isUserLoaded, user, router])

  const isRedirecting = isUserLoaded && !!user?.username

  const isLoading = recentAnswers === undefined || answerCount === undefined || isRedirecting

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 -z-10 h-full w-full bg-background">
            <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px] dark:bg-primary/10" />
          </div>
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <Skeleton className="mx-auto h-12 w-64" />
            </div>
            <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 md:grid-cols-2 md:px-8 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={`skeleton-card-${n}`} className="h-full rounded-xl border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-end gap-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="ml-auto h-4 w-3/4" />
                      <Skeleton className="ml-auto h-4 w-1/2" />
                    </div>
                    <Skeleton className="size-10 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-16 flex flex-col items-center gap-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-12 w-40 rounded-full" />
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background">
          <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px] dark:bg-primary/10" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t('feedTitle')}
            </h1>
          </div>

          {recentAnswers.length === 0 ? (
            <div className="mx-auto max-w-md rounded-3xl border border-border/50 bg-background/50 p-12 text-center backdrop-blur-sm">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>{t('feedEmptyTitle')}</EmptyTitle>
                  <EmptyDescription>{t('feedEmptyDescription')}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <div className="mx-auto max-w-[1600px] px-4 md:px-8">
              <HomeCarousel>
                {recentAnswers.map((qa: RecentAnswer) => (
                  <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4" key={qa.question._id}>
                    <div className="h-full transform rounded-xl transition-all duration-300">
                      <AnsweredQuestionCard
                        anonymousAvatarSeed={qa.question.anonymousAvatarSeed}
                        answerContent={qa.answer.content}
                        answerCreatedAt={qa.answer._creationTime}
                        avatarUrl={qa.recipientAvatarUrl ?? null}
                        firstName={qa.recipientFirstName || qa.recipientUsername || tCommon('user')}
                        isAnonymous={qa.question.isAnonymous}
                        labels={cardLabels}
                        locale={locale}
                        questionContent={qa.question.content}
                        questionCreatedAt={qa.question._creationTime}
                        questionId={qa.question._id}
                        senderAvatarUrl={null}
                        senderName={undefined}
                        signatureColor={qa.recipientSignatureColor}
                        username={qa.recipientUsername || qa.recipientClerkId}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </HomeCarousel>
            </div>
          )}

          <div className="mt-16 flex flex-col items-center gap-6">
            <p className="text-center text-lg text-muted-foreground">{t('trustIndicator', { count: answerCount })}</p>

            <HomeCTAButtons
              startLabel={tCommon('start')}
              loginLabel={tCommon('login')}
              isLoggedIn={isUserLoaded && !!user}
              profileLabel={tProfile('myProfile')}
              profileUrl={user?.username ? `/${user.username}` : undefined}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

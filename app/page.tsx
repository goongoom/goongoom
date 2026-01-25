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
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/convex/_generated/api'
import { hasRedirectedToProfileThisSession, markRedirectedToProfile } from '@/lib/utils/session-cookie'

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

  // Compute redirect check result synchronously to avoid setState in useEffect
  const redirectChecked = useMemo(() => {
    if (!isUserLoaded) return false
    // If user will be redirected, don't mark as checked yet
    if (user?.username && !hasRedirectedToProfileThisSession()) return false
    return true
  }, [isUserLoaded, user?.username])

  useEffect(() => {
    if (!isUserLoaded) return

    if (user?.username && !hasRedirectedToProfileThisSession()) {
      markRedirectedToProfile()
      router.replace(`/${user.username}`)
    }
  }, [isUserLoaded, user, router])

  const isLoading = recentAnswers === undefined || answerCount === undefined || !redirectChecked

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Spinner className="size-8" />
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
                {recentAnswers.map((qa) => (
                  <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4" key={qa.question._id}>
                    <div className="h-full transform rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                      <AnsweredQuestionCard
                        anonymousAvatarSeed={qa.question.anonymousAvatarSeed}
                        answerContent={qa.answer.content}
                        answerCreatedAt={qa.answer._creationTime}
                        avatarUrl={qa.recipientAvatarUrl ?? null}
                        displayName={qa.recipientDisplayName || qa.recipientUsername || tCommon('user')}
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

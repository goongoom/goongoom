import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { AnsweredQuestionCard } from '@/components/questions/answered-question-card'

import { CarouselItem } from '@/components/ui/carousel'
import { HomeCarousel } from '@/components/home/home-carousel'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { getClerkUsersByIds } from '@/lib/clerk'
import { getAnswerCount, getRecentAnswersLimitPerUser } from '@/lib/db/queries'

export default async function Home() {
  const [recentAnswers, answerCount, t, tCommon, tAnswers, locale] = await Promise.all([
    getRecentAnswersLimitPerUser(30, 2),
    getAnswerCount(),
    getTranslations('home'),
    getTranslations('common'),
    getTranslations('answers'),
    getLocale(),
  ])

  const recipientIds = [...new Set(recentAnswers.map((qa) => qa.recipientClerkId))]
  const senderIds = [
    ...new Set(
      recentAnswers
        .filter((qa) => !qa.question.isAnonymous && qa.question.senderClerkId)
        .map((qa) => qa.question.senderClerkId)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  const [recipientMap, senderMap] = await Promise.all([getClerkUsersByIds(recipientIds), getClerkUsersByIds(senderIds)])

  const cardLabels = {
    anonymous: tCommon('anonymous'),
    identified: tCommon('identified'),
    question: t('questionLabel'),
    answer: tAnswers('answer'),
  }

  const questionsWithInfo = recentAnswers
    .map((qa) => {
      const recipient = recipientMap.get(qa.recipientClerkId)
      if (!recipient?.username) {
        return null
      }

      const sender =
        !qa.question.isAnonymous && qa.question.senderClerkId ? senderMap.get(qa.question.senderClerkId) : null

      return {
        ...qa,
        recipientUsername: recipient.username,
        recipientDisplayName: recipient.displayName || recipient.username || 'User',
        recipientAvatarUrl: recipient.avatarUrl,
        recipientSignatureColor: qa.recipientSignatureColor,
        senderName: sender?.displayName || sender?.username || null,
        senderAvatarUrl: sender?.avatarUrl || null,
      }
    })
    .filter((qa) => qa !== null)

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

          {questionsWithInfo.length === 0 ? (
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
                {questionsWithInfo.map((qa) => (
                  <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4" key={qa.question._id}>
                    <div className="h-full transform rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                      <AnsweredQuestionCard
                        anonymousAvatarSeed={qa.question.anonymousAvatarSeed}
                        answerContent={qa.answer.content}
                        answerCreatedAt={qa.answer._creationTime}
                        avatarUrl={qa.recipientAvatarUrl}
                        displayName={qa.recipientDisplayName}
                        isAnonymous={qa.question.isAnonymous}
                        labels={cardLabels}
                        locale={locale}
                        questionContent={qa.question.content}
                        questionCreatedAt={qa.question._creationTime}
                        questionId={qa.question._id}
                        senderAvatarUrl={qa.senderAvatarUrl}
                        senderName={qa.senderName || undefined}
                        signatureColor={qa.recipientSignatureColor}
                        username={qa.recipientUsername}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </HomeCarousel>
            </div>
          )}

          <div className="mt-16 flex flex-col items-center gap-6">
            <p className="text-center text-lg text-muted-foreground">{t('trustIndicator', { count: answerCount })}</p>

            <Link
              className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-primary px-10 text-lg font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              href="/login"
            >
              <span className="mr-2">{tCommon('start')}</span>
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useAuth } from '@clerk/nextjs'
import { useQuery } from 'convex-helpers/react/cache/hooks'
import { useConvexAuth } from 'convex/react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { MainContent } from '@/components/layout/main-content'
import { AnsweredQuestionCard } from '@/components/questions/answered-question-card'
import { usePrefetchQuestionRoutes } from '@/components/navigation/use-prefetch-question-routes'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { api } from '@/convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'

type FriendsAnswer = NonNullable<FunctionReturnType<typeof api.answers.getFriendsAnswers>>[number]

export default function FriendsPage() {
  const { userId: clerkId } = useAuth()
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
  const locale = useLocale()

  const t = useTranslations('friends')
  const tCommon = useTranslations('common')

  const friendsAnswers = useQuery(
    api.answers.getFriendsAnswers,
    isAuthenticated && clerkId ? { clerkId, limit: 30 } : 'skip'
  )

  const cardLabels = useMemo(
    () => ({
      anonymous: tCommon('anonymous'),
      public: tCommon('public'),
    }),
    [tCommon]
  )

  const isDataLoading = friendsAnswers === undefined
  const prefetchQuestionRoutes = useMemo(() => {
    if (!friendsAnswers || friendsAnswers.length === 0) return []
    return friendsAnswers
      .slice(0, 6)
      .map((qa: FriendsAnswer) => `/${qa.recipientUsername || qa.recipientClerkId}/q/${qa.question._id}`)
  }, [friendsAnswers])

  usePrefetchQuestionRoutes(prefetchQuestionRoutes, !isAuthLoading && !isDataLoading)

  if (!isAuthLoading && !isAuthenticated) {
    return null
  }

  return (
    <MainContent>
      <div className="mb-8 space-y-2">
        <h1 className="font-bold text-3xl text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>

      {isAuthLoading || isDataLoading ? (
        <div className="space-y-6 pb-24">
          {[1, 2, 3].map((n) => (
            <AnsweredQuestionCard key={`friends-skeleton-${n}`} isLoading />
          ))}
        </div>
      ) : friendsAnswers.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('emptyDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-6 pb-24">
          {friendsAnswers.map((qa: FriendsAnswer) => (
            <AnsweredQuestionCard
              anonymousAvatarSeed={qa.question.anonymousAvatarSeed}
              answerContent={qa.answer.content}
              answerCreatedAt={qa.answer._creationTime}
              avatarUrl={qa.recipientAvatarUrl ?? null}
              firstName={qa.recipientFirstName || qa.recipientUsername || tCommon('user')}
              isAnonymous={qa.question.isAnonymous}
              key={qa.question._id}
              labels={cardLabels}
              locale={locale}
              questionContent={qa.question.content}
              questionCreatedAt={qa.question._creationTime}
              questionId={qa.question._id}
              senderAvatarUrl={qa.senderAvatarUrl}
              senderName={qa.question.isAnonymous ? undefined : qa.senderFirstName}
              senderSignatureColor={qa.senderSignatureColor}
              signatureColor={qa.recipientSignatureColor}
              username={qa.recipientUsername || qa.recipientClerkId}
            />
          ))}
        </div>
      )}
    </MainContent>
  )
}

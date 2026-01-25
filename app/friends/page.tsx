'use client'

import { useAuth } from '@clerk/nextjs'
import { useConvexAuth, useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'
import { MainContent } from '@/components/layout/main-content'
import { AnsweredQuestionCard } from '@/components/questions/answered-question-card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { api } from '@/convex/_generated/api'

export default function FriendsPage() {
  const { userId: clerkId } = useAuth()
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
  const router = useRouter()
  const locale = useLocale()

  const t = useTranslations('friends')
  const tCommon = useTranslations('common')

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthLoading, isAuthenticated, router])

  const friendsAnswers = useQuery(api.answers.getFriendsAnswers, clerkId ? { clerkId, limit: 30 } : 'skip')

  const cardLabels = useMemo(
    () => ({
      anonymous: tCommon('anonymous'),
      identified: tCommon('identified'),
    }),
    [tCommon]
  )

  const isDataLoading = friendsAnswers === undefined

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
          {friendsAnswers.map((qa) => (
            <AnsweredQuestionCard
              anonymousAvatarSeed={qa.question.anonymousAvatarSeed}
              answerContent={qa.answer.content}
              answerCreatedAt={qa.answer._creationTime}
              avatarUrl={qa.recipientAvatarUrl ?? null}
              displayName={qa.recipientDisplayName || qa.recipientUsername || tCommon('user')}
              isAnonymous={qa.question.isAnonymous}
              key={qa.question._id}
              labels={cardLabels}
              locale={locale}
              questionContent={qa.question.content}
              questionCreatedAt={qa.question._creationTime}
              questionId={qa.question._id}
              senderAvatarUrl={undefined}
              senderName={qa.question.isAnonymous ? undefined : tCommon('identified')}
              signatureColor={qa.recipientSignatureColor}
              username={qa.recipientUsername || qa.recipientClerkId}
            />
          ))}
        </div>
      )}
    </MainContent>
  )
}

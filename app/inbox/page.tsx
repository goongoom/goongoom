'use client'

import { useQuery } from 'convex-helpers/react/cache/hooks'
import { useConvexAuth } from 'convex/react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Suspense, useMemo } from 'react'
import { MainContent } from '@/components/layout/main-content'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { ToastOnMount } from '@/components/ui/toast-on-mount'
import { api } from '@/convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import { useAuth } from '@clerk/nextjs'

type UnansweredQuestion = NonNullable<FunctionReturnType<typeof api.questions.getUnanswered>>[number]
import { InboxList } from './inbox-list'

function ErrorToast() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') ? decodeURIComponent(searchParams.get('error')!) : null
  return error ? <ToastOnMount message={error} type="error" /> : null
}

function InboxContent() {
  const { userId: clerkId } = useAuth()
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()

  const t = useTranslations('inbox')
  const tCommon = useTranslations('common')

  const unansweredQuestions = useQuery(
    api.questions.getUnanswered,
    isAuthenticated && clerkId ? { recipientClerkId: clerkId } : 'skip'
  )

  const questionsWithSenders = useMemo(() => {
    if (!unansweredQuestions) return []

    return unansweredQuestions.map((question: UnansweredQuestion) => ({
      id: question._id,
      content: question.content,
      isAnonymous: question.isAnonymous,
      createdAt: question._creationTime,
      senderName: question.isAnonymous
        ? tCommon('anonymous')
        : question.senderFirstName || question.senderUsername || tCommon('public'),
      senderAvatarUrl: question.isAnonymous ? undefined : question.senderAvatarUrl,
      anonymousAvatarSeed: question.isAnonymous ? question.anonymousAvatarSeed : undefined,
    }))
  }, [unansweredQuestions, tCommon])

  const isDataLoading = unansweredQuestions === undefined

  if (!isAuthLoading && !isAuthenticated) {
    return null
  }

  return (
    <MainContent>
      <div className="mb-8 space-y-2">
        <h1 className="font-bold text-3xl text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
      </div>

      <Suspense fallback={null}>
        <ErrorToast />
      </Suspense>

      {isAuthLoading || isDataLoading ? (
        <InboxList questions={[]} isLoading />
      ) : questionsWithSenders.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('emptyDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <InboxList questions={questionsWithSenders} />
      )}
    </MainContent>
  )
}

export default function InboxPage() {
  return (
    <Suspense fallback={null}>
      <InboxContent />
    </Suspense>
  )
}

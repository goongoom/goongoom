'use client'

import { Preloaded, usePreloadedQuery, useConvexAuth } from 'convex/react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Suspense, useMemo } from 'react'
import { MainContent } from '@/components/layout/main-content'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { ToastOnMount } from '@/components/ui/toast-on-mount'
import { api } from '@/convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import { InboxList } from './inbox-list'

type UnansweredQuestion = NonNullable<FunctionReturnType<typeof api.questions.getUnanswered>>[number]

interface InboxContentProps {
  preloadedQuestions: Preloaded<typeof api.questions.getUnanswered>
}

function ErrorToast() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') ? decodeURIComponent(searchParams.get('error')!) : null
  return error ? <ToastOnMount message={error} type="error" /> : null
}

function InboxContentInner({ preloadedQuestions }: InboxContentProps) {
  const { isLoading: isAuthLoading } = useConvexAuth()

  const t = useTranslations('inbox')
  const tCommon = useTranslations('common')

  const unansweredQuestions = usePreloadedQuery(preloadedQuestions)

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

  if (isAuthLoading) {
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

      {questionsWithSenders.length === 0 ? (
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

export function InboxContent({ preloadedQuestions }: InboxContentProps) {
  return (
    <Suspense fallback={null}>
      <InboxContentInner preloadedQuestions={preloadedQuestions} />
    </Suspense>
  )
}

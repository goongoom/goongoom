'use client'

import { useConvexAuth } from 'convex/react'
import { useQuery } from 'convex/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'
import { MainContent } from '@/components/layout/main-content'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { ToastOnMount } from '@/components/ui/toast-on-mount'
import { api } from '@/convex/_generated/api'
import { useAuth } from '@clerk/nextjs'
import { InboxList } from './inbox-list'

export default function InboxPage() {
  const { userId: clerkId } = useAuth()
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const t = useTranslations('inbox')
  const tCommon = useTranslations('common')

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthLoading, isAuthenticated, router])

  const unansweredQuestions = useQuery(
    api.questions.getUnanswered,
    clerkId ? { recipientClerkId: clerkId } : 'skip'
  )

  const error = searchParams.get('error') ? decodeURIComponent(searchParams.get('error')!) : null

  const questionsWithSenders = useMemo(() => {
    if (!unansweredQuestions) return []

    return unansweredQuestions.map((question) => ({
      id: question._id,
      content: question.content,
      isAnonymous: question.isAnonymous,
      createdAt: question._creationTime,
      senderName: question.isAnonymous
        ? tCommon('anonymous')
        : question.senderDisplayName || question.senderUsername || tCommon('identified'),
      senderAvatarUrl: question.isAnonymous ? undefined : question.senderAvatarUrl,
      anonymousAvatarSeed: question.isAnonymous ? question.anonymousAvatarSeed : undefined,
    }))
  }, [unansweredQuestions, tCommon])

  if (isAuthLoading || !isAuthenticated) {
    return (
      <MainContent>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner className="size-8" />
        </div>
      </MainContent>
    )
  }

  const isLoading = unansweredQuestions === undefined

  if (isLoading) {
    return (
      <MainContent>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner className="size-8" />
        </div>
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

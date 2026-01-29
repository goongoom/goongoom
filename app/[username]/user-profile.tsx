'use client'

import { useAuth } from '@clerk/nextjs'
import { useMutation, Preloaded, usePreloadedQuery } from 'convex/react'
import dynamic from 'next/dynamic'
import { useParams, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo } from 'react'
import { MainContent } from '@/components/layout/main-content'
import { ProfileActions } from '@/components/profile/profile-actions'
import { ProfileCard } from '@/components/profile/profile-card'
import { AnsweredQuestionCard } from '@/components/questions/answered-question-card'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { ToastOnMount } from '@/components/ui/toast-on-mount'
import { Ultralink } from '@/components/navigation/ultralink'
import { usePrefetchQuestionRoutes } from '@/components/navigation/use-prefetch-question-routes'
import { api } from '@/convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import { useLogCollector } from '@/hooks/use-log-collector'
import { DEFAULT_QUESTION_SECURITY_LEVEL } from '@/lib/question-security'

interface UserProfilePageProps {
  preloadedUser: Preloaded<typeof api.users.getByUsername>
  preloadedQuestions: Preloaded<typeof api.questions.getAnsweredByRecipient>
}

type AnsweredQuestion = NonNullable<FunctionReturnType<typeof api.questions.getAnsweredByRecipient>>[number]
type AnsweredQuestionWithAnswer = AnsweredQuestion & { answer: NonNullable<AnsweredQuestion['answer']> }
type QuestionWithFirstAnswer = AnsweredQuestionWithAnswer & { firstAnswer: NonNullable<AnsweredQuestion['answer']> }
import { buildSocialLinks, canAskAnonymousQuestion } from '@/lib/utils/social-links'

const QuestionDrawer = dynamic(
  () => import('@/components/questions/question-drawer').then((mod) => mod.QuestionDrawer),
  { ssr: false }
)

export default function UserProfilePage({ preloadedUser, preloadedQuestions }: UserProfilePageProps) {
  const params = useParams<{ username: string }>()
  const searchParams = useSearchParams()
  const username = params.username
  const { userId: viewerId } = useAuth()

  useEffect(() => {
    if (viewerId) return
    if (document.cookie.includes('referral=')) return

    const utmSource = searchParams.get('utm_source')
    const utmMedium = searchParams.get('utm_medium')
    const utmCampaign = searchParams.get('utm_campaign')
    const utmTerm = searchParams.get('utm_term')
    const utmContent = searchParams.get('utm_content')

    const payload: Record<string, string> = { u: username }

    if (utmSource) payload.s = utmSource
    if (utmMedium) payload.m = utmMedium
    if (utmCampaign) payload.c = utmCampaign
    if (utmTerm) payload.t = utmTerm
    if (utmContent) payload.n = utmContent

    const cookieValue = encodeURIComponent(JSON.stringify(payload))
    document.cookie = `referral=${cookieValue}; path=/; max-age=604800; SameSite=Lax`
  }, [viewerId, username, searchParams])

  const locale = useLocale()
  const createQuestion = useMutation(api.questions.create)
  const { logAction } = useLogCollector()

  const t = useTranslations('questions')
  const tCommon = useTranslations('common')
  const tAnswers = useTranslations('answers')
  const tProfile = useTranslations('profile')
  const tSocial = useTranslations('social')
  const tErrors = useTranslations('errors')

  const dbUser = usePreloadedQuery(preloadedUser)
  const answeredQuestions = usePreloadedQuery(preloadedQuestions)

  const isOwnProfile = Boolean(viewerId && dbUser && viewerId === dbUser.clerkId)

  const isLoading = dbUser === undefined

  const firstName = dbUser?.firstName || dbUser?.username || username
  const fullName = dbUser?.fullName || dbUser?.username || username
  const recipientClerkId = dbUser?.clerkId || ''
  const recipientUsername = dbUser?.username || username

  const error = searchParams.get('error') ? decodeURIComponent(searchParams.get('error')!) : null
  const status = error ? { type: 'error' as const, message: error } : null

  const socialLinks = useMemo(
    () =>
      buildSocialLinks(dbUser?.socialLinks, {
        instagram: tSocial('instagram'),
        twitter: tSocial('twitter'),
        youtube: tSocial('youtube'),
        github: tSocial('github'),
        naverBlog: tSocial('naverBlog'),
        threads: tSocial('threads'),
      }),
    [dbUser?.socialLinks, tSocial]
  )

  const securityLevel = dbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL
  const viewerIsVerified = Boolean(viewerId)
  const canAskAnonymously = canAskAnonymousQuestion(securityLevel, viewerIsVerified)
  const requiresSignIn = !viewerIsVerified && securityLevel !== 'anyone'

  const cardLabels = useMemo(
    () => ({
      anonymous: tCommon('anonymous'),
      public: tCommon('public'),
    }),
    [tCommon]
  )

  const questionsWithAnswers = useMemo((): QuestionWithFirstAnswer[] => {
    if (!answeredQuestions) return []
    return answeredQuestions
      .filter((qa: AnsweredQuestion): qa is AnsweredQuestionWithAnswer => qa.answer !== null)
      .map((qa: AnsweredQuestionWithAnswer) => ({
        ...qa,
        firstAnswer: qa.answer,
      }))
  }, [answeredQuestions])

  const submitQuestion = useCallback(
    async (formData: FormData) => {
      const content = String(formData.get('question') || '').trim()
      const questionType = String(formData.get('questionType') || 'anonymous')
      const avatarSeed = String(formData.get('avatarSeed') || '')

      if (!content) {
        return { success: false, error: tErrors('pleaseEnterQuestion') }
      }

      const isAnonymous = questionType !== 'public'
      try {
        const result = await createQuestion({
          recipientClerkId,
          senderClerkId: viewerId ?? undefined,
          content,
          isAnonymous,
          anonymousAvatarSeed: isAnonymous && avatarSeed ? avatarSeed : undefined,
        })
        logAction({
          action: 'createQuestion',
          entityType: 'question',
          entityId: result?._id,
          success: true,
          payload: { recipientClerkId, isAnonymous },
        })
        return { success: true, error: undefined }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : tErrors('genericError')
        logAction({
          action: 'createQuestion',
          success: false,
          errorMessage,
          payload: { recipientClerkId, isAnonymous },
        })
        return { success: false, error: errorMessage }
      }
    },
    [recipientClerkId, viewerId, createQuestion, tErrors, logAction]
  )

  const isAnswersLoading = answeredQuestions === undefined
  const prefetchQuestionRoutes = useMemo(() => {
    if (!recipientUsername || questionsWithAnswers.length === 0) return []
    return questionsWithAnswers.slice(0, 6).map((qa) => `/${recipientUsername}/q/${qa._id}`)
  }, [questionsWithAnswers, recipientUsername])

  usePrefetchQuestionRoutes(prefetchQuestionRoutes, !isLoading && !isAnswersLoading)

  if (dbUser === null) {
    return (
      <MainContent>
        <Empty className="pb-24">
          <EmptyHeader>
            <EmptyTitle className="text-muted-foreground">{tProfile('userNotFound')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </MainContent>
    )
  }

  return (
    <MainContent>
      {isLoading ? (
        <ProfileCard isLoading />
      ) : (
        <ProfileCard
          fullName={fullName}
          username={recipientUsername}
          avatarUrl={dbUser.avatarUrl}
          bio={dbUser.bio}
          noBioText={tProfile('noBio')}
          socialLinks={socialLinks}
          isOwnProfile={isOwnProfile}
        >
          <ProfileActions
            editButton={
              <Button
                className="h-14 flex-1 rounded-2xl font-semibold"
                nativeButton={false}
                render={<Ultralink href="/settings/profile" />}
                variant="outline"
              >
                {tProfile('edit')}
              </Button>
            }
            username={recipientUsername}
          />
        </ProfileCard>
      )}

      {status && <ToastOnMount message={status.message} type={status.type} />}

      {isLoading || isAnswersLoading ? (
        <div className="space-y-6 pb-24">
          {[1, 2, 3].map((n) => (
            <AnsweredQuestionCard key={`profile-skeleton-${n}`} isLoading />
          ))}
        </div>
      ) : questionsWithAnswers.length > 0 ? (
        <div className="space-y-6 pb-24">
          {questionsWithAnswers.map((qa) => (
            <AnsweredQuestionCard
              anonymousAvatarSeed={qa.anonymousAvatarSeed}
              answerContent={qa.firstAnswer.content}
              answerCreatedAt={qa.firstAnswer._creationTime}
              avatarUrl={dbUser.avatarUrl ?? null}
              firstName={firstName}
              isAnonymous={qa.isAnonymous}
              key={qa._id}
              labels={cardLabels}
              locale={locale}
              questionContent={qa.content}
              questionCreatedAt={qa._creationTime}
              questionId={qa._id}
              senderAvatarUrl={qa.senderAvatarUrl ?? null}
              senderName={qa.senderFirstName || qa.senderUsername}
              senderSignatureColor={qa.senderSignatureColor}
              signatureColor={dbUser.signatureColor}
              username={recipientUsername}
            />
          ))}
        </div>
      ) : (
        <Empty className="pb-24">
          <EmptyHeader>
            <EmptyTitle className="text-muted-foreground">{tAnswers('noAnswersYet')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}

      {recipientClerkId && (
        <QuestionDrawer
          canAskAnonymously={canAskAnonymously}
          canAskPublic={viewerIsVerified}
          recipientClerkId={recipientClerkId}
          recipientName={firstName}
          requiresSignIn={requiresSignIn}
          submitAction={submitQuestion}
          successMessage={t('questionSent')}
        />
      )}
    </MainContent>
  )
}

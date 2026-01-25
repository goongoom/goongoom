'use client'

import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { useParams, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useMemo } from 'react'
import { MainContent } from '@/components/layout/main-content'
import { EditProfileButton } from '@/components/profile/edit-profile-button'
import { ProfileActions } from '@/components/profile/profile-actions'
import { ProfileCard } from '@/components/profile/profile-card'
import { AnsweredQuestionCard } from '@/components/questions/answered-question-card'
import { QuestionDrawer } from '@/components/questions/question-drawer'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { ToastOnMount } from '@/components/ui/toast-on-mount'
import { api } from '@/convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import { DEFAULT_QUESTION_SECURITY_LEVEL } from '@/lib/question-security'

type AnsweredQuestion = NonNullable<FunctionReturnType<typeof api.questions.getAnsweredByRecipient>>[number]
type AnsweredQuestionWithAnswer = AnsweredQuestion & { answer: NonNullable<AnsweredQuestion['answer']> }
type QuestionWithFirstAnswer = AnsweredQuestionWithAnswer & { firstAnswer: NonNullable<AnsweredQuestion['answer']> }
import { buildSocialLinks, canAskAnonymousQuestion } from '@/lib/utils/social-links'

export default function UserProfilePage() {
  const params = useParams<{ username: string }>()
  const searchParams = useSearchParams()
  const username = params.username
  const { userId: viewerId } = useAuth()

  const locale = useLocale()
  const createQuestion = useMutation(api.questions.create)

  const t = useTranslations('questions')
  const tCommon = useTranslations('common')
  const tAnswers = useTranslations('answers')
  const tProfile = useTranslations('profile')
  const tSocial = useTranslations('social')
  const tErrors = useTranslations('errors')

  const dbUser = useQuery(api.users.getByUsername, { username })

  const isOwnProfile = Boolean(viewerId && dbUser && viewerId === dbUser.clerkId)

  const answeredQuestions = useQuery(
    api.questions.getAnsweredByRecipient,
    dbUser?.clerkId ? { recipientClerkId: dbUser.clerkId } : 'skip'
  )

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
      identified: tCommon('identified'),
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
        await createQuestion({
          recipientClerkId,
          senderClerkId: viewerId ?? undefined,
          content,
          isAnonymous,
          anonymousAvatarSeed: isAnonymous && avatarSeed ? avatarSeed : undefined,
        })
        return { success: true, error: undefined }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : tErrors('genericError') }
      }
    },
    [recipientClerkId, viewerId, createQuestion, tErrors]
  )

  const isAnswersLoading = answeredQuestions === undefined

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
          <ProfileActions editButton={<EditProfileButton />} username={recipientUsername} />
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

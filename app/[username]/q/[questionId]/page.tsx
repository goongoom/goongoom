'use client'

import { useAuth } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { formatDistanceToNow } from 'date-fns'
import { enUS, ko } from 'date-fns/locale'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { MainContent } from '@/components/layout/main-content'
import { Ultralink } from '@/components/navigation/ultralink'
import { CopyLinkButton } from '@/components/questions/copy-link-button'
import { DeleteResponseButton } from '@/components/questions/delete-response-button'
import { InstagramSharePrefetch } from '@/components/questions/instagram-share-prefetch'
import { ShareInstagramButton } from '@/components/questions/share-instagram-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

const localeMap = { ko, en: enUS } as const

function getShareAvatarUrl(clerkAvatarUrl: string | null | undefined, seed: string) {
  if (clerkAvatarUrl) {
    return clerkAvatarUrl
  }
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&flip=true`
}

function getDicebearAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&flip=true`
}

interface QuestionerInfo {
  avatarUrl: string | null
  name: string
  fallback: string
}

function getQuestionerInfo(
  isAnonymous: boolean,
  anonymousSeed: string,
  senderFirstName: string | undefined,
  senderAvatarUrl: string | undefined,
  anonymousLabel: string,
  identifiedLabel: string
): QuestionerInfo {
  if (isAnonymous) {
    return {
      avatarUrl: getDicebearAvatarUrl(anonymousSeed),
      name: anonymousLabel,
      fallback: '?',
    }
  }
  return {
    avatarUrl: senderAvatarUrl || null,
    name: senderFirstName || identifiedLabel,
    fallback: senderFirstName?.[0] || '?',
  }
}

function buildShareUrl({
  question,
  answer,
  name,
  askerAvatarUrl,
  answererAvatarUrl,
  signatureColor,
}: {
  question: string
  answer: string
  name: string
  askerAvatarUrl: string
  answererAvatarUrl: string
  signatureColor?: string | null
}) {
  const normalize = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value)
  const params = new URLSearchParams({
    question: normalize(question, 160),
    answer: normalize(answer, 260),
    name: normalize(name, 40),
    askerAvatar: askerAvatarUrl,
    answererAvatar: answererAvatarUrl,
  })
  if (signatureColor) {
    params.set('color', signatureColor)
  }
  return `/api/instagram?${params.toString()}`
}

export default function QADetailPage() {
  const params = useParams<{ username: string; questionId: string }>()
  const { username, questionId: questionIdParam } = params
  const questionId = questionIdParam as Id<'questions'>
  const { userId: viewerId } = useAuth()
  const locale = useLocale()

  const tCommon = useTranslations('common')
  const tProfile = useTranslations('profile')
  const tQuestions = useTranslations('questions')

  const dbUser = useQuery(api.users.getByUsername, { username })
  const qa = useQuery(
    api.questions.getByIdAndRecipient,
    dbUser?.clerkId ? { id: questionId, recipientClerkId: dbUser.clerkId } : 'skip'
  )
  const questionNumber = useQuery(
    api.questions.getAnsweredNumber,
    dbUser?.clerkId ? { questionId, recipientClerkId: dbUser.clerkId } : 'skip'
  )

  const isLoading = dbUser === undefined || qa === undefined || questionNumber === undefined

  const isOwner = viewerId === dbUser?.clerkId
  const firstName = dbUser?.firstName || dbUser?.username || username
  const fullName = dbUser?.fullName || dbUser?.username || username

  const questioner = useMemo(() => {
    if (!qa) return null
    return getQuestionerInfo(
      qa.isAnonymous,
      qa.anonymousAvatarSeed || `anon_${qa._id}`,
      qa.senderFirstName,
      qa.senderAvatarUrl,
      tCommon('anonymous'),
      tCommon('identified')
    )
  }, [qa, tCommon])

  const instagramShareUrl = useMemo(() => {
    if (!qa?.answer || !dbUser) return null

    const askerAvatarForShare = qa.isAnonymous
      ? getShareAvatarUrl(null, qa.anonymousAvatarSeed || `anon_${qa._id}`)
      : getShareAvatarUrl(qa.senderAvatarUrl, qa.senderClerkId || qa._id)
    const answererAvatarForShare = getShareAvatarUrl(dbUser.avatarUrl, dbUser.clerkId)

    return buildShareUrl({
      question: qa.content,
      answer: qa.answer.content,
      name: fullName,
      askerAvatarUrl: askerAvatarForShare,
      answererAvatarUrl: answererAvatarForShare,
      signatureColor: dbUser.signatureColor,
    })
  }, [qa, dbUser, fullName])

  const canonicalUrl = `/${username}/q/${questionId}`

  if (isLoading) {
    return (
      <MainContent>
        <div className="mb-4">
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="mb-6 h-8 w-64" />
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex w-full items-start gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-16 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex w-full items-start justify-end gap-3">
              <div className="flex flex-1 flex-col items-end gap-2">
                <Skeleton className="h-16 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="size-10 rounded-full" />
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </MainContent>
    )
  }

  if (!dbUser || !qa?.answer || !questioner) {
    return (
      <MainContent>
        <Empty className="pb-24">
          <EmptyHeader>
            <EmptyTitle className="text-muted-foreground">{tQuestions('questionNotFound')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </MainContent>
    )
  }

  const { answer } = qa

  return (
    <MainContent>
      <div className="mb-4">
        <Button nativeButton={false} render={<Ultralink href={`/${username}`} />} size="lg" variant="ghost">
          {tProfile('backToProfile', { firstName })}
        </Button>
      </div>

      <h1 className="mb-6 font-bold text-2xl">{tQuestions('questionNumber', { firstName, number: questionNumber })}</h1>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex w-full items-start gap-3">
            <Avatar className="size-10 flex-shrink-0">
              {questioner.avatarUrl && <AvatarImage alt={questioner.name} src={questioner.avatarUrl} />}
              <AvatarFallback>{questioner.fallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Card className="max-w-prose bg-muted/40 px-4 py-3">
                <p className="text-foreground leading-relaxed">{qa.content}</p>
              </Card>
              <p className="mt-1 ml-1 text-muted-foreground text-xs">
                {questioner.name} ·{' '}
                {formatDistanceToNow(qa._creationTime, {
                  addSuffix: true,
                  locale: localeMap[locale as keyof typeof localeMap] ?? enUS,
                })}
              </p>
            </div>
          </div>
          <div className="flex w-full items-start justify-end gap-3">
            <div className="flex flex-1 flex-col items-end">
              <Card className="max-w-prose border-none bg-gradient-to-br from-emerald to-emerald px-4 py-3 text-white">
                <p className="leading-relaxed">{answer.content}</p>
              </Card>
              <p className="mt-1 mr-1 text-muted-foreground text-xs">
                {firstName} ·{' '}
                {formatDistanceToNow(answer._creationTime, {
                  addSuffix: true,
                  locale: localeMap[locale as keyof typeof localeMap] ?? enUS,
                })}
              </p>
            </div>
            <Avatar className="size-10 flex-shrink-0">
              {dbUser.avatarUrl && <AvatarImage alt={firstName} src={dbUser.avatarUrl} />}
              <AvatarFallback>{firstName[0] || '?'}</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {isOwner && instagramShareUrl ? (
          <>
            <ShareInstagramButton
              className="h-14 w-full rounded-2xl font-semibold"
              mode="button"
              shareUrl={instagramShareUrl}
            />
            <CopyLinkButton className="h-14 w-full rounded-2xl" fullWidth url={canonicalUrl} variant="secondary" />
            <DeleteResponseButton answerId={answer._id} profileUrl={`/${username}`} />
          </>
        ) : (
          <Button
            className="h-14 w-full rounded-2xl font-semibold"
            nativeButton={false}
            render={<Ultralink href={`/${username}`} />}
            size="lg"
          >
            {tQuestions('askAnotherQuestion', { firstName })}
          </Button>
        )}
      </div>

      {isOwner && instagramShareUrl && <InstagramSharePrefetch imageUrl={instagramShareUrl} />}
    </MainContent>
  )
}

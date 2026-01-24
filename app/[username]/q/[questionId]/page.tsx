import { auth } from "@clerk/nextjs/server"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { formatDistanceToNow } from "date-fns"
import { enUS, ko } from "date-fns/locale"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { MainContent } from "@/components/layout/main-content"
import { CopyLinkButton } from "@/components/questions/copy-link-button"
import { InstagramSharePrefetch } from "@/components/questions/instagram-share-prefetch"
import { ShareInstagramButton } from "@/components/questions/share-instagram-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getClerkUserById, getClerkUserByUsername } from "@/lib/clerk"
import {
  getAnsweredQuestionNumber,
  getQuestionByIdAndRecipient,
} from "@/lib/db/queries"
import type { QuestionId } from "@/lib/types"

const localeMap = { ko, en: enUS } as const

function getShareAvatarUrl(
  clerkAvatarUrl: string | null | undefined,
  seed: string
) {
  if (clerkAvatarUrl) {
    return clerkAvatarUrl
  }
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&flip=true`
}

function getDicebearAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&flip=true`
}

interface QuestionerInfo {
  avatarUrl: string | null
  name: string
  fallback: string
}

function getQuestionerInfo(
  isAnonymous: boolean,
  anonymousSeed: string,
  senderClerk: {
    avatarUrl?: string | null
    displayName?: string | null
    username?: string | null
  } | null,
  anonymousLabel: string,
  identifiedLabel: string
): QuestionerInfo {
  if (isAnonymous) {
    return {
      avatarUrl: getDicebearAvatarUrl(anonymousSeed),
      name: anonymousLabel,
      fallback: "?",
    }
  }
  return {
    avatarUrl: senderClerk?.avatarUrl || null,
    name: senderClerk?.displayName || senderClerk?.username || identifiedLabel,
    fallback:
      senderClerk?.displayName?.[0] || senderClerk?.username?.[0] || "?",
  }
}

interface QADetailPageProps {
  params: Promise<{ username: string; questionId: string }>
}

function buildShareUrl({
  question,
  answer,
  name,
  askerAvatarUrl,
  answererAvatarUrl,
}: {
  question: string
  answer: string
  name: string
  askerAvatarUrl: string
  answererAvatarUrl: string
}) {
  const normalize = (value: string, max: number) =>
    value.length > max ? `${value.slice(0, max - 1)}…` : value
  const params = new URLSearchParams({
    question: normalize(question, 160),
    answer: normalize(answer, 260),
    name: normalize(name, 40),
    askerAvatar: askerAvatarUrl,
    answererAvatar: answererAvatarUrl,
  })
  return `/api/instagram?${params.toString()}`
}

export default async function QADetailPage({ params }: QADetailPageProps) {
  const { username, questionId: questionIdParam } = await params
  const questionId = questionIdParam as QuestionId

  const [clerkUser, { userId: viewerId }] = await Promise.all([
    getClerkUserByUsername(username),
    auth(),
  ])
  if (!clerkUser) {
    notFound()
  }

  const [qa, questionNumber] = await Promise.all([
    getQuestionByIdAndRecipient(questionId, clerkUser.clerkId),
    getAnsweredQuestionNumber(questionId, clerkUser.clerkId),
  ])
  if (!qa?.answer) {
    notFound()
  }

  const senderClerk =
    !qa.isAnonymous && qa.senderClerkId
      ? await getClerkUserById(qa.senderClerkId)
      : null

  const [tCommon, tProfile, tQuestions, locale] = await Promise.all([
    getTranslations("common"),
    getTranslations("profile"),
    getTranslations("questions"),
    getLocale(),
  ])

  const isOwner = viewerId === clerkUser.clerkId

  const displayName = clerkUser.displayName || clerkUser.username || username
  const { answer } = qa

  const questioner = getQuestionerInfo(
    qa.isAnonymous,
    qa.anonymousAvatarSeed || `anon_${qa._id}`,
    senderClerk,
    tCommon("anonymous"),
    tCommon("identified")
  )

  const askerAvatarForShare = qa.isAnonymous
    ? getShareAvatarUrl(null, qa.anonymousAvatarSeed || `anon_${qa._id}`)
    : getShareAvatarUrl(senderClerk?.avatarUrl, qa.senderClerkId || qa._id)
  const answererAvatarForShare = getShareAvatarUrl(
    clerkUser.avatarUrl,
    clerkUser.clerkId
  )

  const instagramShareUrl = buildShareUrl({
    question: qa.content,
    answer: answer.content,
    name: displayName,
    askerAvatarUrl: askerAvatarForShare,
    answererAvatarUrl: answererAvatarForShare,
  })

  const canonicalUrl = `/${username}/q/${questionId}`

  return (
    <MainContent>
      <div className="mb-4">
        <Button
          className="gap-2 pl-2"
          nativeButton={false}
          render={<Link href={`/${username}`} />}
          size="lg"
          variant="ghost"
        >
          <HugeiconsIcon className="size-5" icon={ArrowLeft01Icon} />
          {tProfile("backToProfile", { displayName })}
        </Button>
      </div>

      <h1 className="mb-6 font-bold text-2xl">
        {tQuestions("questionNumber", { displayName, number: questionNumber })}
      </h1>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex w-full items-start gap-3">
            <Avatar className="size-10 flex-shrink-0">
              {questioner.avatarUrl && (
                <AvatarImage alt={questioner.name} src={questioner.avatarUrl} />
              )}
              <AvatarFallback>{questioner.fallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Card className="max-w-prose bg-muted/40 px-4 py-3">
                <p className="text-foreground leading-relaxed">{qa.content}</p>
              </Card>
              <p className="mt-1 ml-1 text-muted-foreground text-xs">
                {questioner.name} ·{" "}
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
                {displayName} ·{" "}
                {formatDistanceToNow(answer._creationTime, {
                  addSuffix: true,
                  locale: localeMap[locale as keyof typeof localeMap] ?? enUS,
                })}
              </p>
            </div>
            <Avatar className="size-10 flex-shrink-0" key={clerkUser.avatarUrl}>
              {clerkUser.avatarUrl ? (
                <AvatarImage alt={displayName} src={clerkUser.avatarUrl} />
              ) : null}
              <AvatarFallback>{displayName[0] || "?"}</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {isOwner ? (
          <>
            <ShareInstagramButton
              className="h-14 w-full rounded-xl font-semibold"
              mode="button"
              shareUrl={instagramShareUrl}
            />
            <CopyLinkButton
              className="h-14 w-full rounded-xl"
              fullWidth
              url={canonicalUrl}
              variant="secondary"
            />
          </>
        ) : (
          <Button
            className="h-14 w-full rounded-xl font-semibold"
            nativeButton={false}
            render={<Link href={`/${username}`} />}
            size="lg"
          >
            {tQuestions("askAnotherQuestion", { displayName })}
          </Button>
        )}
      </div>

      {isOwner && <InstagramSharePrefetch imageUrl={instagramShareUrl} />}
    </MainContent>
  )
}

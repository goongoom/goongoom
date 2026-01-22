import { auth } from "@clerk/nextjs/server"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
import { getClerkUserByUsername } from "@/lib/clerk"
import {
  getAnsweredQuestionNumber,
  getQuestionByIdAndRecipient,
} from "@/lib/db/queries"
import type { QuestionId } from "@/lib/types"
import { formatRelativeTime } from "@/lib/utils/format-time"

interface QADetailPageProps {
  params: Promise<{ username: string; questionId: string }>
}

function buildShareUrl({
  question,
  answer,
  name,
}: {
  question: string
  answer: string
  name: string
}) {
  const normalize = (value: string, max: number) =>
    value.length > max ? `${value.slice(0, max - 1)}…` : value
  const params = new URLSearchParams({
    question: normalize(question, 160),
    answer: normalize(answer, 260),
    name: normalize(name, 40),
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

  const [tCommon, tProfile, tQuestions, locale] = await Promise.all([
    getTranslations("common"),
    getTranslations("profile"),
    getTranslations("questions"),
    getLocale(),
  ])

  const isOwner = viewerId === clerkUser.clerkId

  const fullName = clerkUser.displayName || clerkUser.username || username
  const displayName = fullName.split(" ")[0] || fullName
  const { answer } = qa

  const instagramShareUrl = buildShareUrl({
    question: qa.content,
    answer: answer.content,
    name: displayName,
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
              <AvatarImage
                alt="Avatar"
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=anon_${qa._id}`}
              />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Card className="max-w-prose bg-muted/40 px-4 py-3">
                <p className="text-foreground leading-relaxed">{qa.content}</p>
              </Card>
              <p className="mt-1 ml-1 text-muted-foreground text-xs">
                {qa.isAnonymous ? tCommon("anonymous") : tCommon("identified")}{" "}
                · {formatRelativeTime(qa._creationTime, locale)}
              </p>
            </div>
          </div>
          <div className="flex w-full items-start justify-end gap-3">
            <div className="flex flex-1 flex-col items-end">
              <Card className="max-w-prose border-none bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-white">
                <p className="leading-relaxed">{answer.content}</p>
              </Card>
              <p className="mt-1 mr-1 text-muted-foreground text-xs">
                {displayName} ·{" "}
                {formatRelativeTime(answer._creationTime, locale)}
              </p>
            </div>
            <Avatar className="size-10 flex-shrink-0">
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

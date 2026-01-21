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
import { getQuestionByIdAndRecipient } from "@/lib/db/queries"
import type { QuestionWithAnswers } from "@/lib/types"
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
  const { username, questionId } = await params

  const parsedQuestionId = Number.parseInt(questionId, 10)
  if (Number.isNaN(parsedQuestionId)) {
    notFound()
  }

  const clerkUser = await getClerkUserByUsername(username)
  if (!clerkUser) {
    notFound()
  }

  const qa = await getQuestionByIdAndRecipient(
    parsedQuestionId,
    clerkUser.clerkId
  )
  if (!qa || qa.answers.length === 0) {
    notFound()
  }

  const [tCommon, tAnswers, tProfile, locale] = await Promise.all([
    getTranslations("common"),
    getTranslations("answers"),
    getTranslations("profile"),
    getLocale(),
  ])

  const fullName = clerkUser.displayName || clerkUser.username || username
  const displayName = fullName.split(" ")[0] || fullName
  const answer = (qa as QuestionWithAnswers).answers[0]
  if (!answer) {
    notFound()
  }

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
          nativeButton={false}
          render={<Link href={`/${username}`} />}
          size="sm"
          variant="ghost"
        >
          {tProfile("backToProfile", { displayName })}
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex w-full items-start gap-3">
            <Avatar className="size-10 flex-shrink-0">
              <AvatarImage
                alt="Avatar"
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=anon_${qa.id}`}
              />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Card className="max-w-prose bg-muted/40 px-4 py-3">
                <p className="text-foreground leading-relaxed">{qa.content}</p>
              </Card>
              <p className="mt-1 ml-1 text-muted-foreground text-xs">
                {qa.isAnonymous === 1
                  ? tCommon("anonymous")
                  : tCommon("identified")}{" "}
                · {formatRelativeTime(qa.createdAt, locale)}
              </p>
            </div>
          </div>
          <div className="flex w-full items-start justify-end gap-3">
            <div className="flex flex-1 flex-col items-end">
              <Card className="max-w-prose border-primary/20 bg-primary px-4 py-3 text-primary-foreground">
                <p className="leading-relaxed">{answer.content}</p>
              </Card>
              <p className="mt-1 mr-1 text-muted-foreground text-xs">
                {displayName} · {formatRelativeTime(answer.createdAt, locale)}{" "}
                {tAnswers("answer")}
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
        <CardContent className="flex items-center justify-end gap-2 border-t pt-4">
          <CopyLinkButton url={canonicalUrl} />
          <ShareInstagramButton shareUrl={instagramShareUrl} />
        </CardContent>
      </Card>

      <InstagramSharePrefetch imageUrl={instagramShareUrl} />
    </MainContent>
  )
}

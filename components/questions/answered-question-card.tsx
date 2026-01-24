import { formatDistanceToNow } from "date-fns"
import { enUS, ko } from "date-fns/locale"
import Link from "next/link"
import { ClampedAnswer } from "@/components/questions/clamped-answer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

const localeMap = { ko, en: enUS } as const

interface AnsweredQuestionCardProps {
  questionId: string
  questionContent: string
  isAnonymous: boolean
  anonymousAvatarSeed?: string
  senderName?: string
  senderAvatarUrl?: string | null
  questionCreatedAt: number
  answerContent: string
  answerCreatedAt: number
  username: string
  displayName: string
  avatarUrl: string | null
  locale: string
  labels: {
    anonymous: string
    identified: string
    question: string
    answer: string
  }
}

function getQuestionerAvatarUrl(
  isAnonymous: boolean,
  anonymousAvatarSeed: string | undefined,
  questionId: string,
  senderAvatarUrl: string | null | undefined
): string | null {
  if (isAnonymous) {
    const seed = anonymousAvatarSeed || `anon_${questionId}`
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&flip=true`
  }
  return senderAvatarUrl || null
}

export function AnsweredQuestionCard({
  questionId,
  questionContent,
  isAnonymous,
  anonymousAvatarSeed,
  senderName,
  senderAvatarUrl,
  questionCreatedAt,
  answerContent,
  answerCreatedAt,
  username,
  displayName,
  avatarUrl,
  locale,
  labels,
}: AnsweredQuestionCardProps) {
  const anonymityLabel = isAnonymous
    ? labels.anonymous
    : senderName || labels.identified
  const fallbackInitial = displayName[0] || "?"
  const questionerAvatarUrl = getQuestionerAvatarUrl(
    isAnonymous,
    anonymousAvatarSeed,
    questionId,
    senderAvatarUrl
  )
  const questionerFallback = isAnonymous ? "?" : senderName?.[0] || "?"

  return (
    <Link
      className="block"
      href={`/${username}/q/${questionId}`}
      prefetch={false}
    >
      <Card className="group relative transition-colors hover:bg-muted/50">
        <CardContent className="flex flex-col gap-4">
          <div className="flex w-full items-start gap-3">
            <Avatar className="size-10 flex-shrink-0">
              {questionerAvatarUrl && (
                <AvatarImage
                  alt={isAnonymous ? "Anonymous" : senderName || "User"}
                  src={questionerAvatarUrl}
                />
              )}
              <AvatarFallback>{questionerFallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Card className="max-w-prose bg-muted/40 px-4 py-3">
                <p className="text-foreground leading-relaxed">
                  {questionContent}
                </p>
              </Card>
              <p className="mt-1 ml-1 text-muted-foreground text-xs">
                {anonymityLabel} ·{" "}
                {formatDistanceToNow(questionCreatedAt, {
                  addSuffix: true,
                  locale: localeMap[locale as keyof typeof localeMap] ?? enUS,
                })}{" "}
                {labels.question}
              </p>
            </div>
          </div>
          <div className="flex w-full items-start justify-end gap-3">
            <div className="flex flex-1 flex-col items-end">
              <Card className="max-w-prose border-none bg-gradient-to-br from-emerald to-emerald px-4 py-3 text-white">
                <ClampedAnswer content={answerContent} />
              </Card>
              <p className="mt-1 mr-1 text-muted-foreground text-xs">
                {displayName} ·{" "}
                {formatDistanceToNow(answerCreatedAt, {
                  addSuffix: true,
                  locale: localeMap[locale as keyof typeof localeMap] ?? enUS,
                })}{" "}
                {labels.answer}
              </p>
            </div>
            <Avatar className="size-10 flex-shrink-0">
              {avatarUrl && <AvatarImage alt={displayName} src={avatarUrl} />}
              <AvatarFallback>{fallbackInitial}</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

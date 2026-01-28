import { formatDistanceToNow } from 'date-fns'
import { enUS, ko } from 'date-fns/locale'
import { Ultralink } from '@/components/navigation/ultralink'
import { ClampedAnswer } from '@/components/questions/clamped-answer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getSignatureColor } from '@/lib/colors/signature-colors'

const localeMap = { ko, en: enUS } as const

type AnsweredQuestionCardProps =
  | {
      isLoading: true
    }
  | {
      isLoading?: false
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
      firstName: string
      avatarUrl: string | null
      locale: string
      labels: {
        anonymous: string
        public: string
      }
      signatureColor?: string | null
    }

function getQuestionerAvatarUrl(
  isAnonymous: boolean,
  anonymousAvatarSeed: string | undefined,
  questionId: string,
  senderAvatarUrl: string | null | undefined
): string | null {
  if (isAnonymous) {
    const seed = anonymousAvatarSeed || `anon_${questionId}`
    return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&flip=true`
  }
  return senderAvatarUrl || null
}

export function AnsweredQuestionCard(props: AnsweredQuestionCardProps) {
  if (props.isLoading) {
    return (
      <Card className="group relative">
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
    )
  }

  const {
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
    firstName,
    avatarUrl,
    locale,
    labels,
    signatureColor,
  } = props

  const anonymityLabel = isAnonymous ? labels.anonymous : senderName || labels.public
  const fallbackInitial = firstName[0] || '?'
  const questionerAvatarUrl = getQuestionerAvatarUrl(isAnonymous, anonymousAvatarSeed, questionId, senderAvatarUrl)
  const questionerFallback = isAnonymous ? '?' : senderName?.[0] || '?'
  const imagesToPrefetch = [questionerAvatarUrl, avatarUrl].filter((url): url is string => Boolean(url))

  const colors = signatureColor ? getSignatureColor(signatureColor) : null
  const answerCardStyle = colors
    ? ({
        '--answer-color-light': colors.light.primary,
        '--answer-color-dark': colors.dark.primary,
      } as React.CSSProperties)
    : undefined

  return (
    <Ultralink className="block h-full" href={`/${username}/q/${questionId}`} prefetchImages={imagesToPrefetch}>
      <Card className="group relative h-full transition-colors">
        <CardContent className="flex flex-col gap-4">
          <div className="flex w-full items-start gap-3">
            <Avatar className="size-10 flex-shrink-0">
              {questionerAvatarUrl && (
                <AvatarImage alt={isAnonymous ? 'Anonymous' : senderName || 'User'} src={questionerAvatarUrl} />
              )}
              <AvatarFallback>{questionerFallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Card className="max-w-prose bg-muted/40 px-4 py-3">
                <p className="whitespace-pre-line text-foreground leading-relaxed">{questionContent}</p>
              </Card>
              <p className="mt-1 ml-1 text-muted-foreground text-xs">
                {anonymityLabel} ·{' '}
                {formatDistanceToNow(questionCreatedAt, {
                  addSuffix: true,
                  locale: localeMap[locale as keyof typeof localeMap] ?? enUS,
                })}
              </p>
            </div>
          </div>
          <div className="flex w-full items-start justify-end gap-3">
            <div className="flex flex-1 flex-col items-end">
              <Card
                className={
                  signatureColor
                    ? 'max-w-prose border-none bg-[var(--answer-color-light)] px-4 py-3 text-white dark:bg-[var(--answer-color-dark)]'
                    : 'max-w-prose border-none bg-gradient-to-br from-emerald to-emerald px-4 py-3 text-white'
                }
                style={answerCardStyle}
              >
                <ClampedAnswer
                  content={answerContent}
                  gradientColors={colors ? { light: colors.light.primary, dark: colors.dark.primary } : undefined}
                />
              </Card>
              <p className="mt-1 mr-1 text-muted-foreground text-xs">
                {firstName} ·{' '}
                {formatDistanceToNow(answerCreatedAt, {
                  addSuffix: true,
                  locale: localeMap[locale as keyof typeof localeMap] ?? enUS,
                })}
              </p>
            </div>
            <Avatar className="size-10 flex-shrink-0">
              {avatarUrl && <AvatarImage alt={firstName} src={avatarUrl} />}
              <AvatarFallback>{fallbackInitial}</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>
    </Ultralink>
  )
}

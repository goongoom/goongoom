'use client'

import { useUser } from '@clerk/nextjs'
import { AnonymousIcon, ArrowRight01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from 'convex/react'
import { formatDistanceToNow } from 'date-fns'
import { enUS, ko } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import posthog from 'posthog-js'
import { memo, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import { useLogCollector } from '@/hooks/use-log-collector'
import type { QuestionId } from '@/lib/types'

function getDicebearUrl(seed: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&flip=true`
}

function getQuestionAvatarUrl(question: QuestionItem): string | undefined {
  if (question.isAnonymous) {
    return getDicebearUrl(question.anonymousAvatarSeed || `anon_${question.id}`)
  }
  return question.senderAvatarUrl ?? undefined
}

interface QuestionItem {
  id: QuestionId
  content: string
  isAnonymous: boolean
  createdAt: number
  senderName: string
  senderAvatarUrl?: string | null
  anonymousAvatarSeed?: string | null
}

interface InboxListProps {
  questions: QuestionItem[]
  isLoading?: boolean
}

const localeMap = { ko, en: enUS } as const

interface InboxListItemProps {
  question: QuestionItem
  onSelect: (question: QuestionItem) => void
  anonymousLabel: string
  dateLocale: (typeof localeMap)[keyof typeof localeMap]
}

const InboxListItem = memo(function InboxListItem({
  question,
  onSelect,
  anonymousLabel,
  dateLocale,
}: InboxListItemProps) {
  const senderLabel = question.isAnonymous ? anonymousLabel : question.senderName

  return (
    <button
      className="group w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={() => onSelect(question)}
      type="button"
    >
      <div className="content-auto flex items-start gap-4 rounded-2xl border border-border/50 bg-background p-4 transition-all group-active:scale-[0.98]">
        <div className="relative flex-shrink-0">
          <Avatar className="size-12 ring-2 ring-background">
            <AvatarImage alt={question.senderName} src={getQuestionAvatarUrl(question)} />
            <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 font-semibold text-muted-foreground">
              {question.senderName[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full ring-2 ring-background bg-gradient-to-br from-emerald to-emerald/80">
            <HugeiconsIcon
              className="size-3 text-white"
              icon={question.isAnonymous ? AnonymousIcon : UserIcon}
              strokeWidth={2.5}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="line-clamp-2 whitespace-pre-line font-medium text-foreground leading-relaxed">
            {question.content}
          </p>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <span className="font-medium text-emerald">{senderLabel}</span>
            <span className="text-muted-foreground/60">·</span>
            <span>
              {formatDistanceToNow(question.createdAt, {
                addSuffix: true,
                locale: dateLocale,
              })}
            </span>
          </div>
        </div>

        <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-all group-hover:bg-emerald group-hover:text-emerald-foreground">
          <HugeiconsIcon className="size-5" icon={ArrowRight01Icon} strokeWidth={2} />
        </div>
      </div>
    </button>
  )
})

export function InboxList({ questions, isLoading }: InboxListProps) {
  const t = useTranslations('answers')
  const tCommon = useTranslations('common')
  const tInbox = useTranslations('inbox')
  const tErrors = useTranslations('errors')
  const locale = useLocale()

  const router = useRouter()
  const { user } = useUser()
  const createAnswerMutation = useMutation(api.answers.create)
  const declineQuestionMutation = useMutation(api.questions.softDelete)
  const restoreQuestionMutation = useMutation(api.questions.restore)
  const { logAction } = useLogCollector()

  const [dismissedQuestionIds, setDismissedQuestionIds] = useState<Set<string>>(new Set())
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [shouldRefreshOnClose, setShouldRefreshOnClose] = useState(false)

  const visibleQuestions = useMemo(
    () => questions.filter((question) => !dismissedQuestionIds.has(question.id)),
    [dismissedQuestionIds, questions]
  )
  const anonymousLabel = tCommon('anonymous')
  const dateLocale = localeMap[locale as keyof typeof localeMap] ?? enUS

  const handleQuestionClick = useCallback((question: QuestionItem) => {
    setSelectedQuestion(question)
    setAnswer('')
    setIsDrawerOpen(true)
  }, [])

  function handleDrawerAnimationEnd(open: boolean) {
    if (!open) {
      setSelectedQuestion(null)
      setAnswer('')
      if (shouldRefreshOnClose) {
        setShouldRefreshOnClose(false)
        router.refresh()
      }
    }
  }

  async function handleSubmit() {
    if (!(selectedQuestion && answer.trim()) || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createAnswerMutation({
        questionId: selectedQuestion.id,
        content: answer.trim(),
      })
      logAction({
        action: 'createAnswer',
        entityType: 'answer',
        entityId: result?._id,
        success: true,
        payload: { questionId: selectedQuestion.id },
      })

      // Track answer creation in PostHog
      posthog.capture('answer_created', {
        question_id: selectedQuestion.id,
        is_anonymous_question: selectedQuestion.isAnonymous,
        answer_length: answer.trim().length,
      })

      setDismissedQuestionIds((prev) => {
        const next = new Set(prev)
        next.add(selectedQuestion.id)
        return next
      })
      setShouldRefreshOnClose(true)
      setIsDrawerOpen(false)
      toast.success(t('answerCreated'))
    } catch (error) {
      console.error('Failed to create answer:', error)
      logAction({
        action: 'createAnswer',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        payload: { questionId: selectedQuestion.id },
      })
      toast.error(tErrors('answerCreateError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDecline() {
    if (!selectedQuestion || isDeclining || !user?.id) {
      if (!user?.id) {
        toast.error(tErrors('loginRequired'))
      }
      return
    }

    const questionToDecline = selectedQuestion

    setIsDeclining(true)
    try {
      await declineQuestionMutation({
        id: questionToDecline.id,
        recipientClerkId: user.id,
      })
      logAction({
        action: 'declineQuestion',
        entityType: 'question',
        entityId: questionToDecline.id,
        success: true,
      })

      // Track question decline in PostHog
      posthog.capture('question_declined', {
        question_id: questionToDecline.id,
        is_anonymous_question: questionToDecline.isAnonymous,
      })

      setDismissedQuestionIds((prev) => {
        const next = new Set(prev)
        next.add(questionToDecline.id)
        return next
      })
      setShouldRefreshOnClose(true)
      setIsDrawerOpen(false)

      toast.success(tInbox('declineSuccess'), {
        duration: 5000,
        action: {
          label: tCommon('undo'),
          onClick: async () => {
            try {
              await restoreQuestionMutation({
                id: questionToDecline.id,
                recipientClerkId: user.id,
              })
              setDismissedQuestionIds((prev) => {
                const next = new Set(prev)
                next.delete(questionToDecline.id)
                return next
              })
              toast.success(tInbox('questionRestored'))
              router.refresh()
            } catch {
              toast.error(tErrors('restoreError'))
            }
          },
        },
      })
    } catch (error) {
      console.error('Failed to decline question:', error)
      logAction({
        action: 'declineQuestion',
        entityType: 'question',
        entityId: questionToDecline.id,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      toast.error(tErrors('questionDeleteError'))
    } finally {
      setIsDeclining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={`inbox-skeleton-${n}`}
            className="flex items-start gap-4 rounded-2xl border border-border/50 bg-background p-4"
          >
            <div className="relative flex-shrink-0">
              <Skeleton className="size-12 rounded-full" />
              <Skeleton className="absolute -right-0.5 -bottom-0.5 size-5 rounded-full" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="size-10 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {visibleQuestions.map((question) => (
          <InboxListItem
            anonymousLabel={anonymousLabel}
            dateLocale={dateLocale}
            key={question.id}
            onSelect={handleQuestionClick}
            question={question}
          />
        ))}
      </div>

      <Drawer
        onAnimationEnd={handleDrawerAnimationEnd}
        onOpenChange={setIsDrawerOpen}
        open={isDrawerOpen}
        repositionInputs={false}
      >
        <DrawerContent className="pb-safe">
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader className="text-left">
              <DrawerTitle className="font-bold text-xl tracking-tight">{t('answerDrawerTitle')}</DrawerTitle>
              {selectedQuestion && (
                <DrawerDescription className="mt-3 rounded-xl border border-border/50 bg-muted/30 p-4 text-left text-foreground">
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className={`flex size-6 items-center justify-center rounded-full ${
                        selectedQuestion.isAnonymous
                          ? 'bg-gradient-to-br from-emerald to-emerald/80'
                          : 'bg-gradient-to-br from-emerald to-emerald/80'
                      }`}
                    >
                      <HugeiconsIcon
                        className="size-3.5 text-white"
                        icon={selectedQuestion.isAnonymous ? AnonymousIcon : UserIcon}
                        strokeWidth={2.5}
                      />
                    </div>
                    <span
                      className={`font-semibold text-sm ${
                        selectedQuestion.isAnonymous ? 'text-emerald' : 'text-emerald'
                      }`}
                    >
                      {selectedQuestion.isAnonymous ? tCommon('anonymous') : selectedQuestion.senderName}
                    </span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">{selectedQuestion.content}</p>
                </DrawerDescription>
              )}
            </DrawerHeader>

            <div className="space-y-2 px-4">
              <Textarea
                className="min-h-28 resize-none rounded-2xl border border-border/50 bg-muted/30 p-4 text-base transition-all focus:border-emerald focus:bg-background focus:ring-2 focus:ring-emerald/20"
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t('answerPlaceholder')}
                rows={4}
                value={answer}
              />
              <div className="flex justify-end">
                <span className="font-medium text-muted-foreground text-xs">{answer.length}</span>
              </div>
            </div>

            <DrawerFooter className="gap-2 pt-4">
              <Button
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-emerald to-emerald/90 font-semibold transition-all disabled:opacity-70"
                disabled={!answer.trim() || isSubmitting}
                onClick={handleSubmit}
                type="button"
              >
                {isSubmitting ? tCommon('submitting') : t('answerButton')}
              </Button>
              <Button
                className="h-14 w-full rounded-2xl text-destructive"
                disabled={isDeclining}
                onClick={handleDecline}
                type="button"
                variant="outline"
              >
                {isDeclining ? tCommon('submitting') : tInbox('declineButton')}
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

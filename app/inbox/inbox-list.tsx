'use client'

import { useUser } from '@clerk/nextjs'
import { AnonymousIcon, ArrowRight01Icon, SentIcon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from 'convex/react'
import { formatDistanceToNow } from 'date-fns'
import { enUS, ko } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import type { QuestionId } from '@/lib/types'

function getDicebearUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&flip=true`
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

  const [dismissedQuestionIds, setDismissedQuestionIds] = useState<Set<string>>(new Set())
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false)
  const [shouldRefreshOnClose, setShouldRefreshOnClose] = useState(false)

  const visibleQuestions = questions.filter((question) => !dismissedQuestionIds.has(question.id))

  function handleQuestionClick(question: QuestionItem) {
    setSelectedQuestion(question)
    setAnswer('')
    setIsDrawerOpen(true)
  }

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
      await createAnswerMutation({
        questionId: selectedQuestion.id,
        content: answer.trim(),
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

    setIsDeclining(true)
    try {
      await declineQuestionMutation({
        id: selectedQuestion.id,
        recipientClerkId: user.id,
      })

      setDismissedQuestionIds((prev) => {
        const next = new Set(prev)
        next.add(selectedQuestion.id)
        return next
      })
      setShouldRefreshOnClose(true)
      setIsDrawerOpen(false)
      toast.success(tInbox('declineSuccess'))
    } catch (error) {
      console.error('Failed to decline question:', error)
      toast.error(tErrors('questionDeleteError'))
    } finally {
      setIsDeclining(false)
      setIsDeclineDialogOpen(false)
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
          <button
            className="group w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            key={question.id}
            onClick={() => handleQuestionClick(question)}
            type="button"
          >
            <div className="flex items-start gap-4 rounded-2xl border border-border/50 bg-background p-4 transition-all group-hover:border-emerald/50 group-hover:bg-emerald/5 group-hover:ring-2 group-hover:ring-emerald/10 group-active:scale-[0.98]">
              <div className="relative flex-shrink-0">
                <Avatar className="size-12 ring-2 ring-background">
                  <AvatarImage alt={question.senderName} src={getQuestionAvatarUrl(question)} />
                  <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 font-semibold text-muted-foreground">
                    {question.senderName[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full ring-2 ring-background ${
                    question.isAnonymous
                      ? 'bg-gradient-to-br from-emerald to-emerald/80'
                      : 'bg-gradient-to-br from-emerald to-emerald/80'
                  }`}
                >
                  <HugeiconsIcon
                    className="size-3 text-white"
                    icon={question.isAnonymous ? AnonymousIcon : UserIcon}
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="line-clamp-2 font-medium text-foreground leading-relaxed">{question.content}</p>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <span className={`font-medium ${question.isAnonymous ? 'text-emerald' : 'text-emerald'}`}>
                    {question.isAnonymous ? tCommon('anonymous') : question.senderName}
                  </span>
                  <span className="text-muted-foreground/60">·</span>
                  <span>
                    {formatDistanceToNow(question.createdAt, {
                      addSuffix: true,
                      locale: localeMap[locale as keyof typeof localeMap] ?? enUS,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-all group-hover:bg-emerald group-hover:text-emerald-foreground">
                <HugeiconsIcon className="size-5" icon={ArrowRight01Icon} strokeWidth={2} />
              </div>
            </div>
          </button>
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
                  <p className="leading-relaxed">
                    {selectedQuestion.content.length > 100
                      ? `${selectedQuestion.content.slice(0, 100)}...`
                      : selectedQuestion.content}
                  </p>
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
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-emerald to-emerald/90 font-semibold text-base transition-all disabled:opacity-70"
                disabled={!answer.trim() || isSubmitting}
                onClick={handleSubmit}
                type="button"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2.5">
                    <Spinner className="size-5 text-white" />
                    <span>{tCommon('submitting')}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2.5">
                    <HugeiconsIcon className="size-5" icon={SentIcon} strokeWidth={2.5} />
                    <span>{t('answerButton')}</span>
                  </span>
                )}
              </Button>
              <AlertDialog onOpenChange={setIsDeclineDialogOpen} open={isDeclineDialogOpen}>
                <AlertDialogTrigger
                  render={
                    <Button className="h-14 w-full rounded-2xl text-destructive" type="button" variant="outline" />
                  }
                >
                  {tInbox('declineButton')}
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{tInbox('declineTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{tInbox('declineDescription')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                    <AlertDialogAction disabled={isDeclining} onClick={handleDecline} type="button">
                      {isDeclining ? <Spinner className="mr-2 size-4" /> : null}
                      {tCommon('decline')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

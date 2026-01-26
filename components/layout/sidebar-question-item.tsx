'use client'

import { AnonymousIcon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { formatDistanceToNow } from 'date-fns'
import { enUS, ko } from 'date-fns/locale'
import { useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useLogCollector } from '@/hooks/use-log-collector'
import { CHAR_LIMITS } from '@/lib/charLimits'
import { cn } from '@/lib/utils'

interface SidebarQuestionItemProps {
  question: {
    id: string
    content: string
    createdAt: number
    senderName?: string
    senderAvatarUrl?: string | null
    isAnonymous?: boolean
  }
}

const localeMap = { ko, en: enUS } as const

export function SidebarQuestionItem({ question }: SidebarQuestionItemProps) {
  const t = useTranslations('answers')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const locale = useLocale()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createAnswer = useMutation(api.answers.create)
  const { logAction } = useLogCollector()

  async function handleSubmit() {
    if (!answer.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await createAnswer({
        questionId: question.id as Id<'questions'>,
        content: answer.trim(),
      })
      logAction({
        action: 'createAnswer',
        entityType: 'answer',
        entityId: result?._id,
        success: true,
        payload: { questionId: question.id },
      })
      setAnswer('')
      setOpen(false)
      router.refresh()
    } catch (err) {
      logAction({
        action: 'createAnswer',
        success: false,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        payload: { questionId: question.id },
      })
      toast.error(err instanceof Error ? err.message : tErrors('genericError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setAnswer('')
      }}
      open={open}
    >
      <DialogTrigger
        render={
          <SidebarMenuButton className="h-auto items-start py-3">
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="line-clamp-2 font-medium text-xs">{question.content}</span>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(question.createdAt, {
                  addSuffix: true,
                  locale: localeMap[locale as keyof typeof localeMap] ?? enUS,
                })}
              </span>
            </div>
          </SidebarMenuButton>
        }
      />
      <DialogContent className="max-w-lg gap-0 p-6 sm:max-w-lg">
        <DialogTitle className="font-bold text-xl tracking-tight">{t('answerDrawerTitle')}</DialogTitle>

        <div className="mt-4 rounded-xl border border-border/50 bg-muted/30 p-4 text-left text-foreground">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-emerald/80">
              <HugeiconsIcon
                className="size-3.5 text-white"
                icon={question.isAnonymous ? AnonymousIcon : UserIcon}
                strokeWidth={2.5}
              />
            </div>
            <span className="font-semibold text-sm text-emerald">
              {question.isAnonymous ? tCommon('anonymous') : question.senderName || tCommon('user')}
            </span>
          </div>
          <DialogDescription className="text-foreground leading-relaxed">{question.content}</DialogDescription>
        </div>

        <div className="mt-4 space-y-2">
          <Textarea
            className="min-h-28 resize-none rounded-2xl border border-border/50 bg-muted/30 p-4 text-base transition-all focus:border-emerald focus:bg-background focus:ring-2 focus:ring-emerald/20"
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t('answerPlaceholder')}
            value={answer}
          />
          <div className="flex justify-end">
            <span
              className={cn(
                'font-medium text-xs',
                answer.length > CHAR_LIMITS.ANSWER ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {answer.length}/{CHAR_LIMITS.ANSWER}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <DialogClose render={<Button className="h-14 flex-1 rounded-2xl font-semibold" variant="outline" />}>
            {tCommon('cancel')}
          </DialogClose>
          <Button
            className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-emerald to-emerald/90 font-semibold transition-all disabled:opacity-70"
            disabled={!answer.trim() || isSubmitting || answer.length > CHAR_LIMITS.ANSWER}
            onClick={handleSubmit}
          >
            {isSubmitting ? tCommon('submitting') : t('answerButton')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

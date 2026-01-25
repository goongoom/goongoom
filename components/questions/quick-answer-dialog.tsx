'use client'

import { Dialog } from '@base-ui/react/dialog'
import { AnonymousIcon, Cancel01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

interface QuickAnswerDialogProps {
  question: {
    id: string
    content: string
    senderName?: string
    senderAvatarUrl?: string | null
    isAnonymous?: boolean
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickAnswerDialog({ question, open, onOpenChange }: QuickAnswerDialogProps) {
  const t = useTranslations('answers')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const router = useRouter()
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createAnswer = useMutation(api.answers.create)

  async function handleSubmit() {
    if (!(question && answer.trim()) || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      await createAnswer({
        questionId: question.id as Id<'questions'>,
        content: answer.trim(),
      })
      setAnswer('')
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tErrors('genericError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    setAnswer('')
    onOpenChange(false)
  }

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
            'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
            'transition-opacity duration-200'
          )}
        />
        <Dialog.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-border/50 bg-background p-6',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'transition-all duration-200'
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="font-bold text-xl tracking-tight">{t('answerDrawerTitle')}</Dialog.Title>
            <Dialog.Close render={<Button onClick={handleClose} size="icon-sm" variant="ghost" />}>
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
              <span className="sr-only">{tCommon('cancel')}</span>
            </Dialog.Close>
          </div>

          {question && (
            <div className="mt-4 rounded-xl border border-border/50 bg-muted/30 p-4 text-left text-foreground">
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`flex size-6 items-center justify-center rounded-full ${
                    question.isAnonymous
                      ? 'bg-gradient-to-br from-emerald to-emerald/80'
                      : 'bg-gradient-to-br from-emerald to-emerald/80'
                  }`}
                >
                  <HugeiconsIcon
                    className="size-3.5 text-white"
                    icon={question.isAnonymous ? AnonymousIcon : UserIcon}
                    strokeWidth={2.5}
                  />
                </div>
                <span className={`font-semibold text-sm ${question.isAnonymous ? 'text-emerald' : 'text-emerald'}`}>
                  {question.isAnonymous ? tCommon('anonymous') : question.senderName || tCommon('user')}
                </span>
              </div>
              <Dialog.Description className="text-foreground leading-relaxed">{question.content}</Dialog.Description>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <Textarea
              className="min-h-28 resize-none rounded-2xl border border-border/50 bg-muted/30 p-4 text-base transition-all focus:border-emerald focus:bg-background focus:ring-2 focus:ring-emerald/20"
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t('answerPlaceholder')}
              value={answer}
            />
            <div className="flex justify-end">
              <span className="font-medium text-muted-foreground text-xs">{answer.length}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              className="h-14 flex-1 rounded-2xl font-semibold text-base"
              onClick={handleClose}
              type="button"
              variant="outline"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-emerald to-emerald/90 font-semibold text-base transition-all disabled:opacity-70"
              disabled={!answer.trim() || isSubmitting}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? tCommon('submitting') : t('answerButton')}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

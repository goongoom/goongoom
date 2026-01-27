'use client'

import { TranslateIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useCompletion } from '@ai-sdk/react'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface TranslateButtonProps {
  text: string
  align?: 'start' | 'end'
}

export function TranslateButton({ text, align = 'start' }: TranslateButtonProps) {
  const t = useTranslations('translate')
  const locale = useLocale()
  const [showTranslation, setShowTranslation] = useState(false)

  const { completion, isLoading, complete } = useCompletion({
    api: '/api/translate',
    onError: () => {
      toast.error(t('translationError'))
      setShowTranslation(false)
    },
  })

  const handleTranslate = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (completion && showTranslation) {
        setShowTranslation(false)
        return
      }

      if (completion) {
        setShowTranslation(true)
        return
      }

      setShowTranslation(true)
      await complete('', {
        body: { text, targetLocale: locale },
      })
    },
    [completion, showTranslation, complete, text, locale]
  )

  const buttonLabel = isLoading
    ? t('translating')
    : showTranslation && completion
      ? t('hideTranslation')
      : t('translate')

  return (
    <div className={align === 'end' ? 'flex flex-col items-end' : ''}>
      <Button
        className="gap-1 text-muted-foreground"
        onClick={handleTranslate}
        size="xs"
        type="button"
        variant="ghost"
      >
        <HugeiconsIcon className="size-3" icon={TranslateIcon} />
        <span className="text-xs">{buttonLabel}</span>
      </Button>

      {showTranslation && (completion || isLoading) && (
        <div className="mt-1 rounded-lg bg-muted/60 px-3 py-2">
          <p className="whitespace-pre-line text-foreground text-sm leading-relaxed">
            {completion || t('translating')}
          </p>
        </div>
      )}
    </div>
  )
}

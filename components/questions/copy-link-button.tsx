'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'

interface CopyLinkButtonProps {
  url: string
  fullWidth?: boolean
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export function CopyLinkButton({ url, fullWidth = false, className, variant = 'ghost' }: CopyLinkButtonProps) {
  const t = useTranslations('share')
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      try {
        const fullUrl = `${window.location.origin}${url}`
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        const textArea = document.createElement('textarea')
        textArea.value = `${window.location.origin}${url}`
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    },
    [url]
  )

  return (
    <Button
      aria-label={copied ? t('linkCopied') : t('copyLink')}
      className={className}
      onClick={handleCopy}
      size={fullWidth ? 'lg' : 'sm'}
      variant={variant}
    >
      {copied ? t('linkCopied') : t('copyLink')}
    </Button>
  )
}

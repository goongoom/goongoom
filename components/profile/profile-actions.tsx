'use client'

import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface ProfileActionsProps {
  username: string
  editButton: React.ReactNode
}

export function ProfileActions({ username, editButton }: ProfileActionsProps) {
  const t = useTranslations('profile')

  const handleShare = useCallback(async () => {
    const fullUrl = `${window.location.origin}/${username}`

    if (navigator.share) {
      try {
        await navigator.share({ url: fullUrl })
      } catch {
        // User cancelled share - intentionally ignored
      }
    } else {
      await navigator.clipboard.writeText(fullUrl)
    }
  }, [username])

  return (
    <div className="flex gap-3">
      {editButton}
      <Button className="h-14 flex-1 rounded-2xl font-semibold" onClick={handleShare} variant="outline">
        {t('shareLink')}
      </Button>
    </div>
  )
}

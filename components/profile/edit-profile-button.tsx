'use client'

import { useTranslations } from 'next-intl'
import { Ultralink } from '@/components/navigation/ultralink'
import { Button } from '@/components/ui/button'

export function EditProfileButton() {
  const t = useTranslations('profile')

  return (
    <Button className="h-14 flex-1 rounded-2xl font-semibold" nativeButton={false} render={<Ultralink href="/settings/profile" />} variant="outline">
      {t('edit')}
    </Button>
  )
}

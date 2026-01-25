'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function AccountSettingsButton() {
  const t = useTranslations('settings')
  const { openUserProfile } = useClerk()
  const { user } = useUser()

  const firstName = user?.firstName || user?.username || '?'

  return (
    <button
      className="group flex w-full items-center gap-4 rounded-2xl bg-card p-5 text-left ring-1 ring-foreground/10 transition-all hover:bg-accent/50 hover:ring-emerald/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
      onClick={() => openUserProfile()}
      type="button"
    >
      <Avatar className="size-12 shrink-0 ring-2 ring-emerald/20">
        {user?.imageUrl && <AvatarImage alt={firstName} src={user.imageUrl} />}
        <AvatarFallback className="bg-emerald/10 font-semibold text-emerald">{firstName[0] || '?'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-foreground">{firstName}</h3>
        <p className="truncate text-muted-foreground text-sm">{t('accountSettingsDescription')}</p>
      </div>
      <HugeiconsIcon
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald"
        icon={ArrowRight01Icon}
        strokeWidth={2}
      />
    </button>
  )
}

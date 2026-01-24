'use client'

import { useClerk } from '@clerk/nextjs'
import { ArrowRight01Icon, Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'

export function LogoutButton() {
  const t = useTranslations('common')
  const { signOut } = useClerk()

  return (
    <button
      className="group flex w-full items-center gap-3 rounded-xl py-3 text-left transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={() => signOut({ redirectUrl: '/' })}
      type="button"
    >
      <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 transition-colors group-hover:bg-destructive/10">
        <HugeiconsIcon
          className="size-4 text-muted-foreground transition-colors group-hover:text-destructive"
          icon={Logout01Icon}
          strokeWidth={2}
        />
      </div>
      <span className="flex-1 font-medium text-muted-foreground text-sm transition-colors group-hover:text-destructive">
        {t('logout')}
      </span>
      <HugeiconsIcon
        className="size-4 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-destructive"
        icon={ArrowRight01Icon}
        strokeWidth={2}
      />
    </button>
  )
}

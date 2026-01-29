'use client'

import { useAuth } from '@clerk/nextjs'
import { LanguageCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import posthog from 'posthog-js'
import { api } from '@/convex/_generated/api'
import { type Locale, localeNames, locales } from '@/i18n/config'
import { localeStore } from '@/i18n/locale-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton } from '@/components/ui/sidebar'

export function LocaleSwitcher() {
  const currentLocale = useLocale() as Locale
  const { userId } = useAuth()
  const router = useRouter()
  const updateLocale = useMutation(api.users.updateLocale)

  function handleLocaleChange(value: string) {
    const locale = value as Locale
    if (locale === currentLocale) return
    posthog.capture('locale_changed', {
      previous_locale: currentLocale,
      new_locale: locale,
    })
    localeStore.setLocale(locale)
    if (userId) {
      updateLocale({ clerkId: userId, locale })
    }
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<SidebarMenuButton />}
      >
        <HugeiconsIcon icon={LanguageCircleIcon} />
        <span>{localeNames[currentLocale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" sideOffset={8}>
        <DropdownMenuRadioGroup value={currentLocale} onValueChange={handleLocaleChange}>
          {locales.map((locale) => (
            <DropdownMenuRadioItem key={locale} value={locale}>
              {localeNames[locale]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

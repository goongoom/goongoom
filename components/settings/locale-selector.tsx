'use client'

import { useAuth } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { api } from '@/convex/_generated/api'
import { type Locale, localeNames, locales } from '@/i18n/config'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'

const LOCALE_COOKIE = 'NEXT_LOCALE'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

export function LocaleSelector() {
  const t = useTranslations('settings')
  const currentLocale = useLocale()
  const { userId } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedLocale, setSelectedLocale] = useState<Locale>(currentLocale as Locale)
  const updateLocale = useMutation(api.users.updateLocale)

  function handleLocaleChange(value: string) {
    const locale = value as Locale
    setSelectedLocale(locale)
    startTransition(async () => {
      document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`
      if (userId) {
        await updateLocale({ clerkId: userId, locale })
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">{t('languageSettings')}</h3>
        <p className="text-muted-foreground text-sm">{t('languageSettingsDescription')}</p>
      </div>

      <RadioGroup
        className="flex w-full gap-2"
        disabled={isPending}
        onValueChange={handleLocaleChange}
        value={selectedLocale}
      >
        {locales.map((locale) => (
          <Label
             className="group flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/50 bg-background px-4 py-3 transition-all disabled:opacity-50 has-data-checked:border-emerald/50 has-data-checked:bg-emerald/5"
            key={locale}
          >
            <RadioGroupItem id={`locale-${locale}`} value={locale} />
            <span className="font-medium text-muted-foreground text-sm transition-colors group-has-data-checked:text-foreground">
              {localeNames[locale]}
            </span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}

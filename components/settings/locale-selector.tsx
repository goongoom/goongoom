'use client'

import { useAuth } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { useLocale, useTranslations } from 'next-intl'
import posthog from 'posthog-js'
import { api } from '@/convex/_generated/api'
import { type Locale, localeNames, locales } from '@/i18n/config'
import { localeStore } from '@/i18n/locale-store'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'

export function LocaleSelector() {
  const t = useTranslations('settings')
  const currentLocale = useLocale() as Locale
  const { userId } = useAuth()
  const updateLocale = useMutation(api.users.updateLocale)

  function handleLocaleChange(value: string) {
    const locale = value as Locale
    posthog.capture('locale_changed', {
      previous_locale: currentLocale,
      new_locale: locale,
    })
    localeStore.setLocale(locale)
    if (userId) {
      updateLocale({ clerkId: userId, locale })
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">{t('languageSettings')}</h3>
        <p className="text-muted-foreground text-sm">{t('languageSettingsDescription')}</p>
      </div>

      <RadioGroup className="flex w-full gap-2" onValueChange={handleLocaleChange} value={currentLocale}>
        {locales.map((locale) => (
          <Label
            className="group flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/50 bg-background px-4 py-3 transition-all disabled:opacity-50 has-data-checked:border-pink-500/50 has-data-checked:bg-pink-500/5"
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

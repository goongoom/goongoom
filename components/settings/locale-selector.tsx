"use client"

import { useLocale, useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { type Locale, localeNames, locales } from "@/i18n/config"
import { setUserLocale } from "@/lib/actions/locale"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

export function LocaleSelector() {
  const t = useTranslations("settings")
  const currentLocale = useLocale()
  const [isPending, startTransition] = useTransition()
  const [selectedLocale, setSelectedLocale] = useState<Locale>(
    currentLocale as Locale
  )

  function handleLocaleChange(value: string) {
    const locale = value as Locale
    setSelectedLocale(locale)
    startTransition(async () => {
      await setUserLocale(locale)
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">
          {t("languageSettings")}
        </h3>
        <p className="text-muted-foreground text-sm">
          {t("languageSettingsDescription")}
        </p>
      </div>

      <RadioGroup
        className="flex w-full gap-2"
        disabled={isPending}
        onValueChange={handleLocaleChange}
        value={selectedLocale}
      >
        {locales.map((locale) => (
          <Label
            className="group flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/50 bg-background px-4 py-3 transition-all hover:border-electric-blue/30 hover:bg-electric-blue/5 disabled:opacity-50 has-data-checked:border-electric-blue/50 has-data-checked:bg-electric-blue/5"
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

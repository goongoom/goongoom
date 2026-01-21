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
        <h3 className="font-medium text-base text-foreground">
          {t("languageSettings")}
        </h3>
        <p className="text-muted-foreground text-xs">
          {t("languageSettingsDescription")}
        </p>
      </div>

      <RadioGroup
        className="w-full"
        disabled={isPending}
        onValueChange={handleLocaleChange}
        value={selectedLocale}
      >
        {locales.map((locale) => (
          <Label
            className="flex items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 disabled:opacity-50 has-[data-checked]:border-primary/48 has-[data-checked]:bg-accent/50"
            key={locale}
          >
            <RadioGroupItem id={`locale-${locale}`} value={locale} />
            <span className="font-medium text-foreground">
              {localeNames[locale]}
            </span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}

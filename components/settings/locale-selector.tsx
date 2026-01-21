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
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold text-base text-foreground">
          {t("languageSettings")}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t("languageSettingsDescription")}
        </p>
      </div>

      <RadioGroup
        className="w-full space-y-3"
        disabled={isPending}
        onValueChange={handleLocaleChange}
        value={selectedLocale}
      >
        {locales.map((locale) => (
          <Label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:border-electric-blue/30 hover:bg-accent/30 disabled:opacity-50 has-[data-checked]:border-electric-blue has-[data-checked]:bg-electric-blue/5 has-[data-checked]:shadow-sm"
            key={locale}
          >
            <RadioGroupItem id={`locale-${locale}`} value={locale} />
            <span className="font-medium text-foreground text-sm">
              {localeNames[locale]}
            </span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}

"use client"

import { ComputerIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useIsClient } from "usehooks-ts"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

const themes = [
  { value: "light", icon: Sun03Icon },
  { value: "dark", icon: Moon02Icon },
  { value: "system", icon: ComputerIcon },
] as const

type Theme = (typeof themes)[number]["value"]

export function ThemeSelector() {
  const t = useTranslations("settings")
  const { theme, setTheme } = useTheme()
  const isClient = useIsClient()

  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">
            {t("themeSettings")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("themeSettingsDescription")}
          </p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2">
          {themes.map((themeOption) => (
            <div
              className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border border-border/50 bg-background p-3"
              key={themeOption.value}
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-muted/50">
                <HugeiconsIcon
                  className="size-4 text-muted-foreground"
                  icon={themeOption.icon}
                  strokeWidth={2}
                />
              </div>
              <span className="font-medium text-muted-foreground text-xs">
                {t(
                  `theme${themeOption.value.charAt(0).toUpperCase()}${themeOption.value.slice(1)}` as
                    | "themeLight"
                    | "themeDark"
                    | "themeSystem"
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">{t("themeSettings")}</h3>
        <p className="text-muted-foreground text-sm">
          {t("themeSettingsDescription")}
        </p>
      </div>

      <RadioGroup
        className="grid w-full grid-cols-3 gap-2"
        onValueChange={(value) => setTheme(value as Theme)}
        value={theme}
      >
        {themes.map((themeOption) => (
          <Label
            className="group flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-border/50 bg-background p-3 transition-all hover:border-emerald/30 hover:bg-emerald/5 has-data-checked:border-emerald/50 has-data-checked:bg-emerald/5"
            key={themeOption.value}
          >
            <RadioGroupItem
              className="pointer-events-none absolute opacity-0"
              id={`theme-${themeOption.value}`}
              value={themeOption.value}
            />
            <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 transition-colors group-has-data-checked:bg-emerald/20 group-has-data-checked:text-emerald">
              <HugeiconsIcon
                className="size-4"
                icon={themeOption.icon}
                strokeWidth={2}
              />
            </div>
            <span className="font-medium text-muted-foreground text-xs transition-colors group-has-data-checked:text-foreground">
              {t(
                `theme${themeOption.value.charAt(0).toUpperCase()}${themeOption.value.slice(1)}` as
                  | "themeLight"
                  | "themeDark"
                  | "themeSystem"
              )}
            </span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}

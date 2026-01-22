"use client"

import { ComputerIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

const themes = [
  { value: "light", icon: Sun03Icon },
  { value: "dark", icon: Moon02Icon },
  { value: "system", icon: ComputerIcon },
] as const

type Theme = (typeof themes)[number]["value"]

const emptySubscribe = () => () => {
  /* no-op unsubscribe */
}

function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function ThemeSelector() {
  const t = useTranslations("settings")
  const { theme, setTheme } = useTheme()
  const mounted = useHasMounted()

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-base text-foreground">
            {t("themeSettings")}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("themeSettingsDescription")}
          </p>
        </div>
        <div className="grid w-full grid-cols-3 gap-3">
          {themes.map((themeOption) => (
            <div
              className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-4"
              key={themeOption.value}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-muted/80">
                <HugeiconsIcon
                  className="size-5 text-muted-foreground"
                  icon={themeOption.icon}
                  strokeWidth={2}
                />
              </div>
              <span className="font-medium text-foreground text-xs">
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold text-base text-foreground">
          {t("themeSettings")}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t("themeSettingsDescription")}
        </p>
      </div>

      <RadioGroup
        className="grid w-full grid-cols-3 gap-3"
        onValueChange={(value) => setTheme(value as Theme)}
        value={theme}
      >
        {themes.map((themeOption) => (
          <Label
            className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-background p-4 transition-all hover:border-electric-blue/30 hover:bg-accent/30 has-[data-checked]:border-electric-blue has-[data-checked]:bg-electric-blue/5"
            key={themeOption.value}
          >
            <RadioGroupItem
              className="pointer-events-none absolute opacity-0"
              id={`theme-${themeOption.value}`}
              value={themeOption.value}
            />
            <div className="flex size-10 items-center justify-center rounded-full bg-muted/80 transition-colors group-has-[data-checked]:bg-electric-blue/20 group-has-[data-checked]:text-electric-blue">
              <HugeiconsIcon
                className="size-5"
                icon={themeOption.icon}
                strokeWidth={2}
              />
            </div>
            <span className="font-medium text-foreground text-xs">
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

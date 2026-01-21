"use client"

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const t = useTranslations("theme")
  const { setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      aria-label={t("toggle")}
      onClick={toggleTheme}
      size="icon-sm"
      variant="ghost"
    >
      <HugeiconsIcon
        className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0"
        icon={Sun03Icon}
      />
      <HugeiconsIcon
        className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100"
        icon={Moon02Icon}
      />
      <span className="sr-only">{t("toggle")}</span>
    </Button>
  )
}

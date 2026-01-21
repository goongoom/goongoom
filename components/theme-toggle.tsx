"use client"

import { ComputerIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getThemeLabel = () => {
    if (theme === "light") {
      return "라이트"
    }
    if (theme === "dark") {
      return "다크"
    }
    return "시스템"
  }

  const getThemeIcon = () => {
    if (resolvedTheme === "dark") {
      return Moon02Icon
    }
    if (resolvedTheme === "light") {
      return Sun03Icon
    }
    return ComputerIcon
  }

  return (
    <Button
      aria-label={`테마 전환 (현재: ${getThemeLabel()})`}
      onClick={cycleTheme}
      size="icon-sm"
      variant="ghost"
    >
      <HugeiconsIcon className="size-4" icon={getThemeIcon()} />
    </Button>
  )
}

"use client"

import { Message01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ProfileDrawer } from "@/components/layout/profile-drawer"
import { ThemeToggle } from "@/components/theme-toggle"

export function GlobalNav() {
  const t = useTranslations("nav")

  return (
    <nav
      aria-label="Global navigation"
      className="fixed top-0 z-50 w-full border-border border-b bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          href="/"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Message01Icon} size={20} strokeWidth={3} />
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">
            {t("appName")}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileDrawer />
        </div>
      </div>
    </nav>
  )
}

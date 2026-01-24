"use client"

import {
  Home01Icon,
  InboxIcon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { TAB_ROUTES } from "@/components/navigation/navigation-routes"
import { Ultralink } from "@/components/navigation/ultralink"
import { usePrefetchRoutes } from "@/components/navigation/use-prefetch-routes"
import { cn } from "@/lib/utils"

const tabItems = [
  { titleKey: "home" as const, href: "/", icon: Home01Icon },
  { titleKey: "inbox" as const, href: "/inbox", icon: InboxIcon },
  { titleKey: "friends" as const, href: "/friends", icon: UserGroupIcon },
  { titleKey: "settings" as const, href: "/settings", icon: Settings01Icon },
]

export function MobileTabBar() {
  const pathname = usePathname()
  const t = useTranslations("sidebar")

  usePrefetchRoutes(TAB_ROUTES)

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-border border-t bg-background/95 pb-safe backdrop-blur-md md:hidden"
    >
      <div className="flex h-16 items-center justify-around">
        {tabItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Ultralink
              className={cn(
                "flex min-h-12 min-w-16 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              <HugeiconsIcon
                icon={item.icon}
                size={22}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="font-medium text-xs">{t(item.titleKey)}</span>
            </Ultralink>
          )
        })}
      </div>
    </nav>
  )
}

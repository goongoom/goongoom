"use client"

import {
  Agreement01Icon,
  CustomerService01Icon,
  Home01Icon,
  InboxIcon,
  SecurityCheckIcon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  GUEST_TAB_ROUTES,
  TAB_ROUTES,
} from "@/components/navigation/navigation-routes"
import { Ultralink } from "@/components/navigation/ultralink"
import { usePrefetchRoutes } from "@/components/navigation/use-prefetch-routes"
import { cn } from "@/lib/utils"

const loggedInTabItems = [
  {
    titleKey: "home" as const,
    href: "/",
    icon: Home01Icon,
    namespace: "sidebar" as const,
  },
  {
    titleKey: "inbox" as const,
    href: "/inbox",
    icon: InboxIcon,
    namespace: "sidebar" as const,
  },
  {
    titleKey: "friends" as const,
    href: "/friends",
    icon: UserGroupIcon,
    namespace: "sidebar" as const,
  },
  {
    titleKey: "settings" as const,
    href: "/settings",
    icon: Settings01Icon,
    namespace: "sidebar" as const,
  },
]

const guestTabItems = [
  {
    titleKey: "home" as const,
    href: "/",
    icon: Home01Icon,
    namespace: "sidebar" as const,
  },
  {
    titleKey: "terms" as const,
    href: "/terms",
    icon: Agreement01Icon,
    namespace: "footer" as const,
  },
  {
    titleKey: "privacy" as const,
    href: "/privacy",
    icon: SecurityCheckIcon,
    namespace: "footer" as const,
  },
  {
    titleKey: "contact" as const,
    href: "/contact",
    icon: CustomerService01Icon,
    namespace: "footer" as const,
  },
]

interface MobileTabBarProps {
  isLoggedIn?: boolean
}

export function MobileTabBar({ isLoggedIn = false }: MobileTabBarProps) {
  const pathname = usePathname()
  const tSidebar = useTranslations("sidebar")
  const tFooter = useTranslations("footer")
  const tUi = useTranslations("ui")

  const tabItems = isLoggedIn ? loggedInTabItems : guestTabItems
  usePrefetchRoutes(isLoggedIn ? TAB_ROUTES : GUEST_TAB_ROUTES)

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const getLabel = (item: (typeof tabItems)[number]) => {
    if (item.namespace === "footer") {
      return tFooter(item.titleKey)
    }
    return tSidebar(item.titleKey)
  }

  return (
    <nav
      aria-label={tUi("mobileNavigation")}
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
              <span className="font-medium text-xs">{getLabel(item)}</span>
            </Ultralink>
          )
        })}
      </div>
    </nav>
  )
}

'use client'

import { useUser } from '@clerk/nextjs'
import {
  Agreement01Icon,
  CustomerService01Icon,
  Home01Icon,
  InboxIcon,
  SecurityCheckIcon,
  Settings01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Ultralink } from '@/components/navigation/ultralink'
import { cn } from '@/lib/utils'

const getGuestTabItems = () => [
  {
    titleKey: 'home' as const,
    href: '/',
    icon: Home01Icon,
    namespace: 'sidebar' as const,
  },
  {
    titleKey: 'terms' as const,
    href: '/terms',
    icon: Agreement01Icon,
    namespace: 'footer' as const,
  },
  {
    titleKey: 'privacy' as const,
    href: '/privacy',
    icon: SecurityCheckIcon,
    namespace: 'footer' as const,
  },
  {
    titleKey: 'contact' as const,
    href: '/contact',
    icon: CustomerService01Icon,
    namespace: 'footer' as const,
  },
]

const getLoggedInTabItems = (username?: string | null) => [
  {
    titleKey: 'home' as const,
    href: username ? `/${username}` : '/',
    icon: Home01Icon,
    namespace: 'sidebar' as const,
  },
  {
    titleKey: 'inbox' as const,
    href: '/inbox',
    icon: InboxIcon,
    namespace: 'sidebar' as const,
  },
  {
    titleKey: 'friends' as const,
    href: '/friends',
    icon: UserGroupIcon,
    namespace: 'sidebar' as const,
  },
  {
    titleKey: 'settings' as const,
    href: '/settings',
    icon: Settings01Icon,
    namespace: 'sidebar' as const,
  },
]

interface MobileTabBarProps {
  isLoggedIn?: boolean
}

export function MobileTabBar({ isLoggedIn = false }: MobileTabBarProps) {
  const pathname = usePathname()
  const tSidebar = useTranslations('sidebar')
  const tFooter = useTranslations('footer')
  const tUi = useTranslations('ui')
  const { user } = useUser()

  const tabItems = isLoggedIn ? getLoggedInTabItems(user?.username) : getGuestTabItems()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (user?.username && href === `/${user.username}`) {
      return pathname === `/${user.username}`
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      aria-label={tUi('mobileNavigation')}
      className="fixed inset-x-0 bottom-0 z-50 border-border border-t bg-background/95 pb-safe backdrop-blur-md md:hidden"
    >
      <div className="flex h-16 items-center justify-around">
        {tabItems.map((item) => {
          const active = isActive(item.href)
          const t = item.namespace === 'footer' ? tFooter : tSidebar
          return (
            <Ultralink
              className={cn(
                'flex min-h-12 min-w-16 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
              href={item.href}
              key={item.href}
            >
              <HugeiconsIcon icon={item.icon} size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="font-medium text-xs">{t(item.titleKey)}</span>
            </Ultralink>
          )
        })}
      </div>
    </nav>
  )
}

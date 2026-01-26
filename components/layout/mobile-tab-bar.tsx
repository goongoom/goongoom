'use client'

import { SignUpButton, useUser } from '@clerk/nextjs'
import {
  Home01Icon,
  InboxIcon,
  Login01Icon,
  Settings01Icon,
  UserAdd01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { PasskeySignInButton } from '@/components/auth/passkey-sign-in-button'
import { Ultralink } from '@/components/navigation/ultralink'
import { cn } from '@/lib/utils'

const guestTabItems = [
  {
    titleKey: 'home' as const,
    href: '/',
    icon: Home01Icon,
    namespace: 'sidebar' as const,
  },
]

interface MobileTabBarProps {
  isLoggedIn?: boolean
}

export function MobileTabBar({ isLoggedIn = false }: MobileTabBarProps) {
  const pathname = usePathname()
  const tSidebar = useTranslations('sidebar')
  const tCommon = useTranslations('common')
  const tUi = useTranslations('ui')
  const { user } = useUser()

  const loggedInTabItems = [
    {
      titleKey: 'home' as const,
      href: user?.username ? `/${user.username}` : '/',
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

  const tabItems = isLoggedIn ? loggedInTabItems : guestTabItems

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (user?.username && href === `/${user.username}`) {
      return pathname === `/${user.username}`
    }
    return pathname.startsWith(href)
  }

  const tabButtonClass = cn(
    'flex min-h-12 min-w-16 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-muted-foreground transition-colors'
  )

  return (
    <nav
      aria-label={tUi('mobileNavigation')}
      className="fixed inset-x-0 bottom-0 z-50 border-border border-t bg-background/95 pb-safe backdrop-blur-md md:hidden"
    >
      <div className="flex h-16 items-center justify-around">
        {tabItems.map((item) => {
          const active = isActive(item.href)
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
              <span className="font-medium text-xs">{tSidebar(item.titleKey)}</span>
            </Ultralink>
          )
        })}
        {!isLoggedIn && (
          <>
            <PasskeySignInButton>
              <button className={tabButtonClass} type="button">
                <HugeiconsIcon icon={Login01Icon} size={22} strokeWidth={2} />
                <span className="font-medium text-xs">{tCommon('login')}</span>
              </button>
            </PasskeySignInButton>
            <SignUpButton mode="modal">
              <button className={tabButtonClass} type="button">
                <HugeiconsIcon icon={UserAdd01Icon} size={22} strokeWidth={2} />
                <span className="font-medium text-xs">{tCommon('start')}</span>
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </nav>
  )
}

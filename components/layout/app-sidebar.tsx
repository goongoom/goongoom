'use client'

import { SignUpButton, useUser } from '@clerk/nextjs'
import {
  Agreement01Icon,
  CustomerService01Icon,
  Home01Icon,
  InboxIcon,
  Login01Icon,
  SecurityCheckIcon,
  Settings01Icon,
  UserAdd01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type * as React from 'react'
import { PasskeySignInButton } from '@/components/auth/passkey-sign-in-button'
import { SidebarQuestionItem } from '@/components/layout/sidebar-question-item'
import { GUEST_TAB_ROUTES, TAB_ROUTES } from '@/components/navigation/navigation-routes'
import { Ultralink } from '@/components/navigation/ultralink'
import { usePrefetchRoutes } from '@/components/navigation/use-prefetch-routes'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Logo } from '@/components/ui/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

interface RecentQuestion {
  id: string
  content: string
  createdAt: number
  senderName?: string
  senderAvatarUrl?: string | null
  isAnonymous?: boolean
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  recentQuestions?: RecentQuestion[]
}

export function AppSidebar({ recentQuestions = [], ...props }: AppSidebarProps) {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const tSidebar = useTranslations('sidebar')
  const tFooter = useTranslations('footer')
  const pathname = usePathname()
  const { user } = useUser()

  usePrefetchRoutes(user ? TAB_ROUTES : GUEST_TAB_ROUTES)

  const loggedInNavItems = [
    {
      title: tSidebar('home'),
      url: user?.username ? `/${user.username}` : '/',
      icon: Home01Icon,
    },
    {
      title: tSidebar('inbox'),
      url: '/inbox',
      icon: InboxIcon,
    },
    {
      title: tSidebar('friends'),
      url: '/friends',
      icon: UserGroupIcon,
    },
    {
      title: tSidebar('settings'),
      url: '/settings',
      icon: Settings01Icon,
    },
  ]

  const guestNavItems = [
    {
      title: tSidebar('home'),
      url: '/',
      icon: Home01Icon,
    },
    {
      title: tFooter('terms'),
      url: '/terms',
      icon: Agreement01Icon,
    },
    {
      title: tFooter('privacy'),
      url: '/privacy',
      icon: SecurityCheckIcon,
    },
    {
      title: tFooter('contact'),
      url: '/contact',
      icon: CustomerService01Icon,
    },
  ]

  const navItems = user ? loggedInNavItems : guestNavItems

  const isActive = (url: string) => {
    if (url === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(url)
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              render={user?.username ? <Ultralink href={`/${user.username}`} /> : <Ultralink href="/" />}
              size="lg"
            >
              {user ? (
                <>
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage alt={user.firstName || user.username || ''} src={user.imageUrl} />
                    <AvatarFallback className="rounded-lg bg-emerald text-emerald-foreground">
                      {user.firstName?.[0] || user.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {t('userAppName', {
                        firstName: user.firstName || user.username || '',
                      })}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Logo size="md" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{t('appName')}</span>
                  </div>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {!user && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <PasskeySignInButton>
                  <SidebarMenuButton tooltip={tCommon('login')}>
                    <HugeiconsIcon icon={Login01Icon} />
                    <span>{tCommon('login')}</span>
                  </SidebarMenuButton>
                </PasskeySignInButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SignUpButton mode="modal">
                  <SidebarMenuButton tooltip={tCommon('start')}>
                    <HugeiconsIcon icon={UserAdd01Icon} />
                    <span>{tCommon('start')}</span>
                  </SidebarMenuButton>
                </SignUpButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    render={<Ultralink href={item.url} />}
                    tooltip={item.title}
                  >
                    <HugeiconsIcon icon={item.icon} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && recentQuestions.length > 0 && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>{tSidebar('recentQuestions')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentQuestions.map((question) => (
                  <SidebarMenuItem key={question.id}>
                    <SidebarQuestionItem question={question} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

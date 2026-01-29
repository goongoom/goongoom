'use client'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

interface RecentQuestion {
  id: string
  content: string
  createdAt: number
  senderName?: string
  senderAvatarUrl?: string | null
  isAnonymous?: boolean
}

interface AppShellProps {
  children: React.ReactNode
  recentQuestions?: RecentQuestion[]
  isLoggedIn?: boolean
}

export function AppShell({ children, recentQuestions = [], isLoggedIn = false }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar recentQuestions={recentQuestions} />
      <SidebarInset className="pb-24 md:pb-0">{children}</SidebarInset>
      <MobileTabBar isLoggedIn={isLoggedIn} />
    </SidebarProvider>
  )
}

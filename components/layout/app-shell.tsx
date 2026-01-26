'use client'

import dynamic from 'next/dynamic'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

const AppSidebar = dynamic(() => import('@/components/layout/app-sidebar').then((mod) => mod.AppSidebar), {
  ssr: false,
})
const MobileTabBar = dynamic(() => import('@/components/layout/mobile-tab-bar').then((mod) => mod.MobileTabBar), {
  ssr: false,
})

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
    <SidebarProvider defaultOpen>
      <AppSidebar recentQuestions={recentQuestions} />
      <SidebarInset className="pb-24 md:pb-0">{children}</SidebarInset>
      <MobileTabBar isLoggedIn={isLoggedIn} />
    </SidebarProvider>
  )
}

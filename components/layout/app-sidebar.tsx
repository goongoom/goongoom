"use client"

import { useUser } from "@clerk/nextjs"
import {
  Home01Icon,
  InboxIcon,
  Message01Icon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { formatDistanceToNow } from "date-fns"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import type * as React from "react"
import { TransitionLink } from "@/components/navigation/transition-link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "@/components/ui/sidebar"

interface RecentQuestion {
  id: string
  content: string
  createdAt: number
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  recentQuestions?: RecentQuestion[]
  onQuestionClick?: (id: string) => void
}

export function AppSidebar({
  recentQuestions = [],
  onQuestionClick,
  ...props
}: AppSidebarProps) {
  const t = useTranslations("nav")
  const tSidebar = useTranslations("sidebar")
  const pathname = usePathname()
  const { user } = useUser()

  const navItems = [
    {
      title: tSidebar("home"),
      url: user?.username ? `/${user.username}` : "/",
      icon: Home01Icon,
    },
    {
      title: tSidebar("inbox"),
      url: "/inbox",
      icon: InboxIcon,
    },
    {
      title: tSidebar("friends"),
      url: "/friends",
      icon: UserGroupIcon,
    },
    {
      title: tSidebar("settings"),
      url: "/settings",
      icon: Settings01Icon,
    },
  ]

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/"
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
              render={
                user?.username ? (
                  <TransitionLink href={`/${user.username}`} />
                ) : undefined
              }
              size="lg"
            >
              {user ? (
                <>
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      alt={user.firstName || user.username || ""}
                      src={user.imageUrl}
                    />
                    <AvatarFallback className="rounded-lg bg-electric-blue text-electric-blue-foreground">
                      {user.firstName?.[0] || user.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {t("userAppName", {
                        firstName: user.firstName || user.username || "",
                      })}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-electric-blue text-electric-blue-foreground">
                    <HugeiconsIcon className="size-4" icon={Message01Icon} />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {t("appName")}
                    </span>
                  </div>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    render={<TransitionLink href={item.url} />}
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

        {recentQuestions.length > 0 && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>{tSidebar("recentQuestions")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentQuestions.map((question) => (
                  <SidebarMenuItem key={question.id}>
                    <SidebarMenuButton
                      className="h-auto items-start py-3"
                      onClick={() => onQuestionClick?.(question.id)}
                    >
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="line-clamp-2 font-medium text-xs">
                          {question.content}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(question.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </SidebarMenuButton>
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

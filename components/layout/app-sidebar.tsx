"use client"

import { useUser } from "@clerk/nextjs"
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
import { formatDistanceToNow } from "date-fns"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import type * as React from "react"
import {
  GUEST_TAB_ROUTES,
  TAB_ROUTES,
} from "@/components/navigation/navigation-routes"
import { Ultralink } from "@/components/navigation/ultralink"
import { usePrefetchRoutes } from "@/components/navigation/use-prefetch-routes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/ui/logo"
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
  const tFooter = useTranslations("footer")
  const pathname = usePathname()
  const { user } = useUser()

  usePrefetchRoutes(user ? TAB_ROUTES : GUEST_TAB_ROUTES)

  const loggedInNavItems = [
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

  const guestNavItems = [
    {
      title: tSidebar("home"),
      url: "/",
      icon: Home01Icon,
    },
    {
      title: tFooter("terms"),
      url: "/terms",
      icon: Agreement01Icon,
    },
    {
      title: tFooter("privacy"),
      url: "/privacy",
      icon: SecurityCheckIcon,
    },
    {
      title: tFooter("contact"),
      url: "/contact",
      icon: CustomerService01Icon,
    },
  ]

  const navItems = user ? loggedInNavItems : guestNavItems

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
                  <Ultralink href={`/${user.username}`} />
                ) : (
                  <Ultralink href="/" />
                )
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
                    <AvatarFallback className="rounded-lg bg-emerald text-emerald-foreground">
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
                  <Logo size="md" />
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

"use client"

import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs"
import {
  InboxIcon,
  Logout03Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

function ProfileDrawerContent() {
  const t = useTranslations("profile")
  const tCommon = useTranslations("common")
  const { user } = useUser()
  const profileHref = user?.username ? `/${user.username}` : "/settings"

  return (
    <>
      <DrawerHeader className="sr-only">
        <DrawerTitle>{tCommon("menu")}</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-1 p-4">
        <DrawerClose asChild>
          <Button
            className="h-12 w-full justify-start gap-2 px-4"
            nativeButton={false}
            render={<Link href={profileHref} />}
            variant="ghost"
          >
            <HugeiconsIcon className="size-5" icon={UserIcon} />
            <span className="font-medium">{t("myProfile")}</span>
          </Button>
        </DrawerClose>

        <DrawerClose asChild>
          <Button
            className="h-12 w-full justify-start gap-2 px-4"
            nativeButton={false}
            render={<Link href="/inbox" />}
            variant="ghost"
          >
            <HugeiconsIcon className="size-5" icon={InboxIcon} />
            <span className="font-medium">{t("inboxMenu")}</span>
          </Button>
        </DrawerClose>

        <DrawerClose asChild>
          <Button
            className="h-12 w-full justify-start gap-2 px-4"
            nativeButton={false}
            render={<Link href="/settings" />}
            variant="ghost"
          >
            <HugeiconsIcon className="size-5" icon={Settings01Icon} />
            <span className="font-medium">{t("settingsMenu")}</span>
          </Button>
        </DrawerClose>

        <Separator className="my-2" />

        <SignOutButton>
          <Button
            className="h-12 w-full justify-start gap-2 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
            variant="ghost"
          >
            <HugeiconsIcon className="size-5" icon={Logout03Icon} />
            <span className="font-medium">{tCommon("logout")}</span>
          </Button>
        </SignOutButton>
      </div>
    </>
  )
}

function SignedOutContent() {
  const t = useTranslations("auth")
  const tCommon = useTranslations("common")

  return (
    <>
      <DrawerHeader className="text-left">
        <DrawerTitle className="text-xl">{t("welcome")}</DrawerTitle>
        <DrawerDescription>{t("welcomeDescription")}</DrawerDescription>
      </DrawerHeader>

      <div className="flex flex-col gap-2 p-4">
        <SignInButton mode="modal">
          <Button className="h-12 w-full" size="lg" variant="outline">
            {tCommon("login")}
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="h-12 w-full" size="lg">
            {tCommon("start")}
          </Button>
        </SignUpButton>
      </div>
    </>
  )
}

export function ProfileDrawer() {
  const t = useTranslations("auth")
  const [open, setOpen] = useState(false)
  const { user } = useUser()

  return (
    <>
      <ClerkLoading>
        <Skeleton className="size-10 rounded-full" />
      </ClerkLoading>
      <ClerkLoaded>
        <Drawer onOpenChange={setOpen} open={open}>
          <button
            aria-label={t("openProfileMenu")}
            className="flex size-11 items-center justify-center rounded-full ring-2 ring-border/50 transition-all hover:ring-electric-blue/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2"
            onClick={() => setOpen(true)}
            type="button"
          >
            <SignedIn>
              <Avatar className="size-10">
                {user?.imageUrl ? (
                  <AvatarImage
                    alt={user.fullName || user.username || "Profile"}
                    src={user.imageUrl}
                  />
                ) : null}
                <AvatarFallback className="bg-muted text-sm">
                  {user?.fullName?.[0]?.toUpperCase() ||
                    user?.username?.[0]?.toUpperCase() ||
                    "?"}
                </AvatarFallback>
              </Avatar>
            </SignedIn>
            <SignedOut>
              <Avatar className="size-10">
                <AvatarFallback className="bg-muted">
                  <HugeiconsIcon
                    className="size-5 text-muted-foreground"
                    icon={UserIcon}
                  />
                </AvatarFallback>
              </Avatar>
            </SignedOut>
          </button>

          <DrawerContent className="pb-safe">
            <SignedIn>
              <ProfileDrawerContent />
            </SignedIn>
            <SignedOut>
              <SignedOutContent />
            </SignedOut>
          </DrawerContent>
        </Drawer>
      </ClerkLoaded>
    </>
  )
}

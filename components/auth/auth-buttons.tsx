"use client"

import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function NavAuthButtons() {
  const t = useTranslations("common")

  return (
    <>
      <ClerkLoading>
        <Skeleton className="h-11 w-36 rounded-lg sm:h-12" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <SignInButton mode="modal">
            <Button size="sm" variant="ghost">
              {t("login")}
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">{t("start")}</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </ClerkLoaded>
    </>
  )
}

export function HeroAuthButtons() {
  const t = useTranslations("auth")
  const { user } = useUser()
  const profileHref = user?.username ? `/${user.username}` : "/settings"

  return (
    <>
      <ClerkLoading>
        <Skeleton className="h-11 w-full rounded-lg sm:h-12 sm:w-64" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <SignUpButton mode="modal">
            <Button className="w-full sm:w-auto" size="lg">
              {t("createProfile")}
              <HugeiconsIcon
                className="transition-transform"
                icon={ArrowRight01Icon}
                size={20}
              />
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button className="w-full sm:w-auto" size="lg" variant="outline">
              {t("login")}
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Button
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link href={profileHref} />}
            size="lg"
          >
            {t("viewProfile")}
            <HugeiconsIcon
              className="transition-transform"
              icon={ArrowRight01Icon}
              size={20}
            />
          </Button>
        </SignedIn>
      </ClerkLoaded>
    </>
  )
}

export function BottomCTAButton() {
  const t = useTranslations("auth")
  const { user } = useUser()
  const profileHref = user?.username ? `/${user.username}` : "/settings"

  return (
    <>
      <ClerkLoading>
        <Skeleton className="mx-auto h-11 w-32 rounded-lg sm:h-12" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <SignUpButton mode="modal">
            <Button size="lg">{t("start")}</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Button
            nativeButton={false}
            render={<Link href={profileHref} />}
            size="lg"
          >
            {t("viewProfile")}
          </Button>
        </SignedIn>
      </ClerkLoaded>
    </>
  )
}

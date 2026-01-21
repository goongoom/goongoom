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
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function NavAuthButtons() {
  return (
    <>
      <ClerkLoading>
        <Skeleton className="h-11 w-36 rounded-lg sm:h-12" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <SignInButton mode="modal">
            <Button size="sm" variant="ghost">
              로그인
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">시작하기</Button>
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
              내 프로필 만들기
              <HugeiconsIcon
                className="transition-transform"
                icon={ArrowRight01Icon}
                size={20}
              />
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button className="w-full sm:w-auto" size="lg" variant="outline">
              로그인하기
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Button
            className="w-full sm:w-auto"
            render={<Link href={profileHref} />}
            size="lg"
          >
            내 프로필 보기
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
            <Button size="lg">시작</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Button render={<Link href={profileHref} />} size="lg">
            내 프로필 보기
          </Button>
        </SignedIn>
      </ClerkLoaded>
    </>
  )
}

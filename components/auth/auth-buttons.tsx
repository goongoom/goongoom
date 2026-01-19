"use client";

import Link from "next/link";
import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export function NavAuthButtons() {
  return (
    <>
      <ClerkLoading>
          <Skeleton className="h-8 w-36 rounded-lg" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              로그인
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">
              시작하기
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton/>
        </SignedIn>
      </ClerkLoaded>
    </>
  );
}

export function HeroAuthButtons() {
  const { user } = useUser();
  const profileHref = user?.username ? `/${user.username}` : "/settings";

  return (
    <>
      <ClerkLoading>
          <Skeleton className="h-10 w-full rounded-lg sm:w-64" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <SignUpButton mode="modal">
            <Button size="xl" className="w-full sm:w-auto">
              내 프로필 만들기
              <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="transition-transform" />
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button variant="outline" size="xl" className="w-full sm:w-auto">
              로그인하기
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Button size="xl" className="w-full sm:w-auto" render={<Link href={profileHref} />}>
            내 프로필 보기
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="transition-transform" />
          </Button>
        </SignedIn>
      </ClerkLoaded>
    </>
  );
}

export function BottomCTAButton() {
  const { user } = useUser();
  const profileHref = user?.username ? `/${user.username}` : "/settings";

  return (
    <>
      <ClerkLoading>
        <Skeleton className="mx-auto h-11 w-32 rounded-lg" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <SignUpButton mode="modal">
            <Button size="xl">
              시작
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Button size="xl" render={<Link href={profileHref} />}>
            내 프로필 보기
          </Button>
        </SignedIn>
      </ClerkLoaded>
    </>
  );
}

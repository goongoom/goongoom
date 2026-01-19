"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export function NavAuthButtons() {
  return (
    <>
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
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  );
}

export function HeroAuthButtons() {
  return (
    <>
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
        <Button size="xl" className="w-full sm:w-auto" render={<Link href="/me" />}>
          내 프로필 보기
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="transition-transform" />
        </Button>
      </SignedIn>
    </>
  );
}

export function BottomCTAButton() {
  return (
    <>
      <SignedOut>
        <SignUpButton mode="modal">
          <Button size="xl">
            시작
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Button size="xl" render={<Link href="/me" />}>
          내 프로필 보기
        </Button>
      </SignedIn>
    </>
  );
}

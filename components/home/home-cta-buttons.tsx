'use client'

import { SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
import { PasskeySignInButton } from '@/components/auth/passkey-sign-in-button'
import { Button } from '@/components/ui/button'

interface HomeCTAButtonsProps {
  startLabel: string
  loginLabel: string
  isLoggedIn?: boolean
  profileLabel?: string
  profileUrl?: string
}

export function HomeCTAButtons({
  startLabel,
  loginLabel,
  isLoggedIn = false,
  profileLabel,
  profileUrl,
}: HomeCTAButtonsProps) {
  if (isLoggedIn && profileUrl && profileLabel) {
    return (
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-3">
       <Link
           href={profileUrl}
           className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-primary px-10 text-lg font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
         >
           <span className="mr-2">{profileLabel}</span>
           <svg
             className="h-5 w-5 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-3">
      <SignUpButton mode="modal">
         <button
           type="button"
           className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-primary px-10 text-lg font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
         >
           <span className="mr-2">{startLabel}</span>
           <svg
             className="h-5 w-5 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </SignUpButton>
      <PasskeySignInButton>
        <Button variant="ghost" size="lg" className="h-14 rounded-full px-8 text-lg font-medium">
          {loginLabel}
        </Button>
      </PasskeySignInButton>
    </div>
  )
}

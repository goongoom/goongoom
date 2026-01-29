'use client'

import { SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HomeSignUpButtonProps {
  label: string
  className?: string
}

export function HomeSignUpButton({ label, className }: HomeSignUpButtonProps) {
  return (
    <SignUpButton mode="modal">
      <Button size="lg" className={cn('h-11 rounded-full px-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90', className)}>
        {label}
      </Button>
    </SignUpButton>
  )
}

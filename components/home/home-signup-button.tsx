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
      <Button size="lg" className={cn('h-11 rounded-full px-6', className)}>
        {label}
      </Button>
    </SignUpButton>
  )
}

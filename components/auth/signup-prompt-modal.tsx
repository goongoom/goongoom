'use client'

import { SignUpButton } from '@clerk/nextjs'
import { CheckmarkCircle02Icon, UserAdd01Icon, MessageQuestionIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

interface SignupPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignupPromptModal({ open, onOpenChange }: SignupPromptModalProps) {
  const t = useTranslations('signupPrompt')
  const tCommon = useTranslations('common')
  const [signedUp, setSignedUp] = useState(false)

  // Track when signup prompt is shown
  useEffect(() => {
    if (open) {
      posthog.capture('signup_prompt_shown')
    }
  }, [open])

  const handleDismiss = () => {
    onOpenChange(false)
  }

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent
        className={cn(
          'overflow-hidden border-primary/20 bg-primary text-primary-foreground',
          'w-full max-w-md gap-0 p-0'
        )}
      >
        <div className="pointer-events-none absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary-foreground/10 p-20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 rounded-full bg-emerald/30 p-16 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center p-8 pt-12 text-center">
          {signedUp ? (
            <div className="flex flex-col items-center">
              <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground backdrop-blur-md">
                <HugeiconsIcon className="size-10" icon={CheckmarkCircle02Icon} />
              </div>
              <h2 className="mb-2 font-bold text-2xl text-primary-foreground">{t('welcomeTitle')}</h2>
              <p className="text-primary-foreground/90">{t('welcomeDescription')}</p>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <div className="flex size-20 rotate-3 items-center justify-center rounded-2xl bg-primary-foreground/20 text-primary-foreground backdrop-blur-md">
                  <HugeiconsIcon className="size-10" icon={MessageQuestionIcon} />
                </div>
                <div className="absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full bg-primary-foreground/30 text-primary-foreground">
                  <HugeiconsIcon className="size-4" icon={UserAdd01Icon} />
                </div>
              </div>

              <DrawerHeader className="mb-8 items-center p-0">
                <DrawerTitle className="mb-2 font-bold text-2xl text-primary-foreground">{t('title')}</DrawerTitle>
                <DrawerDescription className="max-w-xs whitespace-pre-line text-base text-primary-foreground/90">
                  {t('description')}
                </DrawerDescription>
              </DrawerHeader>

              <div className="w-full space-y-2">
                <SignUpButton mode="modal">
                  <Button
                    className="h-14 w-full rounded-2xl border-none bg-white font-bold text-base text-primary transition-all"
                    onClick={() => setSignedUp(true)}
                    size="lg"
                  >
                    {tCommon('start')}
                  </Button>
                </SignUpButton>

                <Button
                  className="h-14 w-full rounded-2xl font-medium text-primary-foreground/70"
                  onClick={handleDismiss}
                  size="lg"
                  variant="ghost"
                >
                  {t('later')}
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

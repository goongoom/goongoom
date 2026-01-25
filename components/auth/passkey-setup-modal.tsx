'use client'

import { useUser } from '@clerk/nextjs'
import { Cancel01Icon, CheckmarkCircle02Icon, FingerPrintIcon, SecurityCheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export function PasskeySetupModal() {
  const t = useTranslations('passkey')
  const { user, isLoaded } = useUser()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      const hasPasskeys = user.passkeys && user.passkeys.length > 0
      const isDismissed = localStorage.getItem('goongoom:passkey-nudge-dismissed')

      if (!(hasPasskeys || isDismissed)) {
        const timer = setTimeout(() => setOpen(true), 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [isLoaded, user])

  const handleDismiss = () => {
    localStorage.setItem('goongoom:passkey-nudge-dismissed', 'true')
    setOpen(false)
  }

  const createPasskey = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await user?.createPasskey()
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
      }, 2000)
    } catch (err: unknown) {
      console.error('Error creating passkey:', err)
      setError(t('setupError'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoaded && user?.passkeys && user.passkeys.length > 0 && !success) {
    return null
  }

  return (
    <Drawer onOpenChange={(val) => !val && handleDismiss()} open={open}>
      <DrawerContent
        className={cn(
          'overflow-hidden border-primary/20 bg-primary text-primary-foreground',
          'w-full max-w-md gap-0 p-0'
        )}
      >
        <div className="pointer-events-none absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary-foreground/10 p-20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 rounded-full bg-emerald/30 p-16 blur-2xl" />

        {!success && (
          <button
            aria-label={t('later')}
            className="absolute top-4 right-4 z-50 flex size-11 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            onClick={handleDismiss}
            type="button"
          >
            <HugeiconsIcon className="size-5" icon={Cancel01Icon} />
          </button>
        )}

        <div className="relative z-10 flex flex-col items-center p-8 pt-12 text-center">
          {success ? (
            <div className="flex flex-col items-center">
              <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground backdrop-blur-md">
                <HugeiconsIcon className="size-10" icon={CheckmarkCircle02Icon} />
              </div>
              <h2 className="mb-2 font-bold text-2xl text-primary-foreground">{t('setupComplete')}</h2>
              <p className="text-primary-foreground/90">{t('setupCompleteDescription')}</p>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <div className="flex size-20 rotate-3 items-center justify-center rounded-2xl bg-primary-foreground/20 text-primary-foreground backdrop-blur-md">
                  <HugeiconsIcon className="size-10" icon={FingerPrintIcon} />
                </div>
                <div className="absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full bg-primary-foreground/30 text-primary-foreground">
                  <HugeiconsIcon className="size-4" icon={SecurityCheckIcon} />
                </div>
              </div>

              <DrawerHeader className="mb-8 items-center p-0">
                <DrawerTitle className="mb-2 font-bold text-2xl text-primary-foreground">
                  {t('fasterTitle')}
                </DrawerTitle>
                <DrawerDescription className="max-w-xs whitespace-pre-line text-base text-primary-foreground/90">
                  {t('fasterDescription')}
                </DrawerDescription>
              </DrawerHeader>

              {error && (
                <div className="mb-6 flex w-full items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/20 p-3 text-primary-foreground text-sm backdrop-blur-sm">
                  <div className="size-1.5 rounded-full bg-destructive" />
                  {error}
                </div>
              )}

              <div className="w-full space-y-2">
                <Button
                  className="h-14 w-full rounded-2xl border-none bg-white font-bold text-primary transition-all hover:bg-white/90"
                  disabled={isLoading}
                  onClick={createPasskey}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2 size-5 text-primary" />
                      {t('settingUp')}
                    </>
                  ) : (
                    t('setupNow')
                  )}
                </Button>

                <Button
                  className="h-14 w-full rounded-2xl font-medium text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
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

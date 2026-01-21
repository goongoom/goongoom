"use client"

import { useUser } from "@clerk/nextjs"
import {
  CheckCircleIcon,
  FingerprintIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export function PasskeySetupModal() {
  const t = useTranslations("passkey")
  const { user, isLoaded } = useUser()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      const hasPasskeys = user.passkeys && user.passkeys.length > 0
      const isDismissed = localStorage.getItem(
        "goongoom:passkey-nudge-dismissed"
      )

      if (!(hasPasskeys || isDismissed)) {
        const timer = setTimeout(() => setOpen(true), 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [isLoaded, user])

  const handleDismiss = () => {
    localStorage.setItem("goongoom:passkey-nudge-dismissed", "true")
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
      console.error("Error creating passkey:", err)
      setError(t("setupError"))
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
          "overflow-hidden border-primary/20 bg-primary text-primary-foreground",
          "w-full max-w-md gap-0 p-0"
        )}
      >
        <div className="pointer-events-none absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 p-20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 rounded-full bg-purple/30 p-16 blur-2xl" />

        {!success && (
          <button
            className="absolute top-4 right-4 z-50 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            onClick={handleDismiss}
            type="button"
          >
            <XIcon className="size-5" />
          </button>
        )}

        <div className="relative z-10 flex flex-col items-center p-8 pt-12 text-center">
          {success ? (
            <div className="flex animate-scale-in flex-col items-center">
              <div className="mb-6 flex size-20 animate-bounce items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
                <CheckCircleIcon className="size-10" />
              </div>
              <h2 className="mb-2 font-bold text-2xl text-white">
                {t("setupComplete")}
              </h2>
              <p className="text-white/90">{t("setupCompleteDescription")}</p>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <div className="flex size-20 rotate-3 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
                  <FingerprintIcon className="size-10" />
                </div>
                <div className="absolute -top-2 -right-2 flex size-8 animate-bounce items-center justify-center rounded-full bg-white/30 text-white">
                  <ShieldCheckIcon className="size-4" />
                </div>
              </div>

              <DrawerHeader className="mb-8 items-center p-0">
                <DrawerTitle className="mb-2 font-bold text-2xl text-white">
                  {t("fasterTitle")}
                </DrawerTitle>
                <DrawerDescription className="max-w-xs whitespace-pre-line text-base text-primary-foreground/90">
                  {t("fasterDescription")}
                </DrawerDescription>
              </DrawerHeader>

              {error && (
                <div className="mb-6 flex w-full items-center gap-2 rounded-lg border border-red-200/20 bg-red-500/20 p-3 text-sm text-white backdrop-blur-sm">
                  <div className="size-1.5 rounded-full bg-red-400" />
                  {error}
                </div>
              )}

              <div className="w-full space-y-2">
                <Button
                  className="w-full rounded-xl border-none bg-white font-bold text-base text-primary transition-all hover:bg-white/90"
                  disabled={isLoading}
                  onClick={createPasskey}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2 size-5 text-primary" />
                      {t("settingUp")}
                    </>
                  ) : (
                    t("setupNow")
                  )}
                </Button>

                <Button
                  className="w-full rounded-xl font-medium text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={handleDismiss}
                  size="lg"
                  variant="ghost"
                >
                  {t("later")}
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

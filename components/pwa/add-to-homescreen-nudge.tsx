"use client"

import { useUser } from "@clerk/nextjs"
import {
  Cancel01Icon,
  MoreHorizontalIcon,
  Share08Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
import { cn } from "@/lib/utils"

const STORAGE_KEY = "goongoom:a2hs-nudge-dismissed"
const MOBILE_DEVICE_REGEX = /iphone|ipad|ipod|android/
const IOS_DEVICE_REGEX = /iphone|ipad|ipod/

function isStandalone(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  )
}

function isMobileDevice(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  return MOBILE_DEVICE_REGEX.test(userAgent)
}

function isIOSDevice(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  return IOS_DEVICE_REGEX.test(userAgent)
}

export function AddToHomeScreenNudge() {
  const t = useTranslations("a2hs")
  const { user, isLoaded } = useUser()
  const [open, setOpen] = useState(false)
  const isIOS = typeof window !== "undefined" && isIOSDevice()

  useEffect(() => {
    if (!(isLoaded && user)) {
      return
    }

    const isMobile = isMobileDevice()
    const isAlreadyInstalled = isStandalone()
    const isDismissed = localStorage.getItem(STORAGE_KEY)

    if (isMobile && !isAlreadyInstalled && !isDismissed) {
      const timer = setTimeout(() => setOpen(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, user])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    setOpen(false)
  }

  if (!(isLoaded && user)) {
    return null
  }

  return (
    <Drawer onOpenChange={(val) => !val && handleDismiss()} open={open}>
      <DrawerContent
        className={cn(
          "overflow-hidden border-electric-blue/20 bg-electric-blue text-electric-blue-foreground",
          "w-full max-w-md gap-0 p-0"
        )}
      >
        <div className="pointer-events-none absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 p-20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 rounded-full bg-purple/30 p-16 blur-2xl" />

        <button
          aria-label={t("dismiss")}
          className="absolute top-4 right-4 z-50 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          onClick={handleDismiss}
          type="button"
        >
          <HugeiconsIcon className="size-5" icon={Cancel01Icon} />
        </button>

        <div className="relative z-10 flex flex-col items-center p-8 pt-12 text-center">
          <div className="relative mb-6">
            <div className="flex size-20 rotate-3 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md">
              <HugeiconsIcon className="size-10" icon={SmartPhone01Icon} />
            </div>
          </div>

          <DrawerHeader className="mb-6 items-center p-0">
            <DrawerTitle className="mb-2 font-bold text-2xl text-white">
              {t("title")}
            </DrawerTitle>
            <DrawerDescription className="max-w-xs whitespace-pre-line text-base text-electric-blue-foreground/90">
              {t("description")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="mb-8 w-full rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="mb-3 font-medium text-sm text-white/90">
              {t("howTo")}
            </p>
            <div className="flex flex-col gap-2 text-left text-sm text-white/80">
              {isIOS ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20 font-medium text-white text-xs">
                      1
                    </span>
                    <span className="flex items-center gap-1">
                      {t("iosStep1")}
                      <HugeiconsIcon
                        className="inline size-4"
                        icon={Share08Icon}
                      />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20 font-medium text-white text-xs">
                      2
                    </span>
                    <span>{t("iosStep2")}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20 font-medium text-white text-xs">
                      1
                    </span>
                    <span className="flex items-center gap-1">
                      {t("androidStep1")}
                      <HugeiconsIcon
                        className="inline size-4"
                        icon={MoreHorizontalIcon}
                      />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20 font-medium text-white text-xs">
                      2
                    </span>
                    <span>{t("androidStep2")}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-full">
            <Button
              className="w-full rounded-xl font-medium text-white/70 hover:bg-white/10 hover:text-white"
              onClick={handleDismiss}
              size="lg"
              variant="ghost"
            >
              {t("dismiss")}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

"use client"

import { useUser } from "@clerk/nextjs"
import { CheckCircleIcon, FingerprintIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export function PasskeyNudge() {
  const t = useTranslations("passkey")
  const { user, isLoaded } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isLoaded) {
    return null
  }

  if (user?.passkeys && user.passkeys.length > 0) {
    return null
  }

  const createPasskey = async () => {
    setIsLoading(true)
    try {
      await user?.createPasskey()
      setSuccess(true)
    } catch (err: unknown) {
      console.error("Error creating passkey:", err)
      toast.error(t("setupError"))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="relative my-6 animate-pop overflow-hidden border-lime/20 bg-lime/10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lime/5 to-transparent" />
        <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-lime/20 text-lime">
            <CheckCircleIcon className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-lime-700 dark:text-lime-400">
              {t("setupComplete")}
            </h3>
            <p className="text-lime-600/80 text-sm dark:text-lime-300/80">
              {t("setupCompleteDescription")}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "group relative my-6 animate-slide-up-fade overflow-hidden border-primary/20 bg-primary/5",
        "text-foreground"
      )}
    >
      <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 p-12 blur-3xl transition-colors duration-500 group-hover:bg-white/20" />
      <div className="absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 rounded-full bg-purple/20 p-10 blur-2xl" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 font-bold text-xl">
              {t("nudgeTitle")}
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">
              {t("nudgeDescription")}
            </CardDescription>
          </div>
          <div className="hidden size-10 rotate-3 items-center justify-center rounded-xl bg-primary/10 text-primary backdrop-blur-md transition-transform duration-300 group-hover:rotate-12 sm:flex">
            <FingerprintIcon className="size-6" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-4 pb-6">
        <Button
          className="group/btn w-full font-bold text-base"
          disabled={isLoading}
          onClick={createPasskey}
          size="lg"
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 size-5" />
              {t("settingUp")}
            </>
          ) : (
            <>
              {t("setupNow")}
              <FingerprintIcon className="ml-2 size-4 transition-transform group-hover/btn:scale-110" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

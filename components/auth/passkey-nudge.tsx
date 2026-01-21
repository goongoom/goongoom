"use client"

import { useUser } from "@clerk/nextjs"
import { AlertCircleIcon, CheckCircleIcon, FingerprintIcon } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  const { user, isLoaded } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isLoaded) {
    return null
  }

  if (user?.passkeys && user.passkeys.length > 0) {
    return null
  }

  const createPasskey = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await user?.createPasskey()
      setSuccess(true)
    } catch (err: unknown) {
      console.error("Error creating passkey:", err)
      setError("패스키 설정 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="relative animate-pop overflow-hidden border-lime/20 bg-lime/10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lime/5 to-transparent" />
        <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex size-12 animate-bounce items-center justify-center rounded-full bg-lime/20 text-lime">
            <CheckCircleIcon className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-lime-700 dark:text-lime-400">
              설정 완료!
            </h3>
            <p className="text-lime-600/80 text-sm dark:text-lime-300/80">
              이제 더 빠르고 안전하게 로그인할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "group hover-lift relative animate-slide-up-fade overflow-hidden border-none bg-gradient-to-br from-electric-blue via-purple to-electric-blue",
        "text-electric-blue-foreground shadow-electric-blue/20 shadow-lg"
      )}
    >
      <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 p-12 blur-3xl transition-colors duration-500 group-hover:bg-white/20" />
      <div className="absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 rounded-full bg-purple/20 p-10 blur-2xl" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 font-bold text-xl">
              <span className="text-2xl">🔐</span> 패스키 설정
            </CardTitle>
            <CardDescription className="font-medium text-electric-blue-foreground/80">
              Face ID나 지문으로 더 빠르고 안전하게 로그인하세요!
            </CardDescription>
          </div>
          <div className="hidden size-10 rotate-3 items-center justify-center rounded-xl bg-white/20 text-white shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:rotate-12 sm:flex">
            <FingerprintIcon className="size-6" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-4 pb-6">
        {error && (
          <Alert
            className="mb-4 border-red-200/20 bg-red-500/20 text-white backdrop-blur-sm"
            variant="destructive"
          >
            <AlertCircleIcon className="size-4 text-white" />
            <AlertDescription className="text-white/90">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Button
          className="group/btn h-12 w-full border-none bg-white font-bold text-base text-electric-blue shadow-md hover:bg-white/90"
          disabled={isLoading}
          onClick={createPasskey}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 size-5 text-electric-blue" />
              설정 중...
            </>
          ) : (
            <>
              지금 설정하기
              <FingerprintIcon className="ml-2 size-4 transition-transform group-hover/btn:scale-110" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

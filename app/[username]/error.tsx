"use client"

import { captureException } from "@sentry/nextjs"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("errors")

  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-4">
      <h2 className="font-semibold text-lg">{t("somethingWentWrong")}</h2>
      <Button onClick={reset} variant="outline">
        {t("tryAgain")}
      </Button>
    </div>
  )
}

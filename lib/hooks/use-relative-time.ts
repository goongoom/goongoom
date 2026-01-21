"use client"

import { useLocale, useTranslations } from "next-intl"
import { useCallback } from "react"

export function useRelativeTime() {
  const t = useTranslations("time")
  const locale = useLocale()

  return useCallback(
    (date: Date): string => {
      const now = new Date()
      const diffMs = now.getTime() - new Date(date).getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 1) {
        return t("justNow")
      }
      if (diffMins < 60) {
        return t("minutesAgo", { minutes: diffMins })
      }
      if (diffHours < 24) {
        return t("hoursAgo", { hours: diffHours })
      }
      if (diffDays < 7) {
        return t("daysAgo", { days: diffDays })
      }
      return new Date(date).toLocaleDateString(
        locale === "ko" ? "ko-KR" : "en-US"
      )
    },
    [t, locale]
  )
}

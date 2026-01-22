const TIME_TRANSLATIONS = {
  ko: {
    justNow: "방금 전",
    minutesAgo: (minutes: number) => `${minutes}분 전`,
    hoursAgo: (hours: number) => `${hours}시간 전`,
    daysAgo: (days: number) => `${days}일 전`,
  },
  en: {
    justNow: "Just now",
    minutesAgo: (minutes: number) => `${minutes}m ago`,
    hoursAgo: (hours: number) => `${hours}h ago`,
    daysAgo: (days: number) => `${days}d ago`,
  },
} as const

export function formatRelativeTime(
  date: Date | number,
  locale: string
): string {
  const now = new Date()
  const dateObj = typeof date === "number" ? new Date(date) : date
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const t =
    TIME_TRANSLATIONS[locale as keyof typeof TIME_TRANSLATIONS] ||
    TIME_TRANSLATIONS.ko

  if (diffMins < 1) {
    return t.justNow
  }
  if (diffMins < 60) {
    return t.minutesAgo(diffMins)
  }
  if (diffHours < 24) {
    return t.hoursAgo(diffHours)
  }
  if (diffDays < 7) {
    return t.daysAgo(diffDays)
  }
  return dateObj.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")
}

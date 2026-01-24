"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

function Spinner({ className }: { className?: string }) {
  const t = useTranslations("ui")
  return (
    <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} role="status" aria-label={t("loading")} className={cn("size-4 animate-spin", className)} />
  )
}

export { Spinner }

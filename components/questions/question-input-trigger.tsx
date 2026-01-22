"use client"

import { SentIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

function QuestionInputTrigger({
  className,
  ref,
  ...props
}: ComponentProps<"button">) {
  const t = useTranslations("questions")

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-tab-bar z-40 bg-gradient-to-t from-background via-background/80 to-transparent p-4 md:bottom-0 md:left-(--sidebar-width)">
      <button
        aria-label={t("writeQuestion")}
        className={cn(
          "pointer-events-auto flex min-h-12 w-full items-center justify-between gap-4 rounded-full border border-border/50 bg-background/80 px-5 py-3.5 shadow-sm backdrop-blur-md transition-all hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        ref={ref}
        type="button"
        {...props}
      >
        <span className="font-medium text-muted-foreground/80 text-sm sm:text-base">
          {t("inputPlaceholder")}
        </span>
        <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
          <HugeiconsIcon className="size-5" icon={SentIcon} strokeWidth={2.5} />
        </div>
      </button>
    </div>
  )
}

export { QuestionInputTrigger }

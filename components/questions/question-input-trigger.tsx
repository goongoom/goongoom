"use client"

import { SentIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

function QuestionInputTrigger({
  className,
  ref,
  ...props
}: ComponentProps<"button">) {
  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-40 bg-gradient-to-t from-background via-background/80 to-transparent p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <button
        aria-label="질문 작성하기"
        className={cn(
          "hover-lift tap-scale pointer-events-auto flex min-h-11 w-full items-center justify-between gap-4 rounded-full border border-border/50 bg-background/80 px-5 py-3.5 shadow-lg backdrop-blur-md transition-all hover:bg-muted/50 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-12",
          className
        )}
        ref={ref}
        type="button"
        {...props}
      >
        <span className="font-medium text-muted-foreground/80 text-sm sm:text-base">
          질문을 입력하세요…
        </span>
        <div className="flex size-11 items-center justify-center rounded-full bg-electric-blue text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-active:scale-95 sm:size-12">
          <HugeiconsIcon className="size-5" icon={SentIcon} strokeWidth={2.5} />
        </div>
      </button>
    </div>
  )
}

export { QuestionInputTrigger }

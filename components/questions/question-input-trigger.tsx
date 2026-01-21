"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { SentIcon } from "@hugeicons/core-free-icons";

const QuestionInputTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none">
        <button
          ref={ref}
          className={cn(
            "pointer-events-auto flex w-full min-h-11 items-center justify-between gap-4 rounded-full border border-border/50 bg-background/80 px-5 py-3.5 shadow-lg backdrop-blur-md transition-all hover:bg-muted/50 hover:shadow-xl hover-lift tap-scale focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-12",
            className
          )}
          type="button"
          aria-label="질문 작성하기"
          {...props}
        >
          <span className="text-sm font-medium text-muted-foreground/80 sm:text-base">질문을 입력하세요…</span>
          <div className="flex size-11 items-center justify-center rounded-full bg-electric-blue text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-active:scale-95 sm:size-12">
            <HugeiconsIcon icon={SentIcon} className="size-5" strokeWidth={2.5} />
          </div>
        </button>
      </div>
    );
  }
);
QuestionInputTrigger.displayName = "QuestionInputTrigger";

export { QuestionInputTrigger };

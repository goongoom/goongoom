import { SentIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { BottomCTAButton } from "@/components/auth/auth-buttons"

interface LandingCTAProps {
  t: (key: string, values?: Record<string, string | number | Date>) => string
  userCount: number
}

export function LandingCTA({ t, userCount }: LandingCTAProps) {
  return (
    <div className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-8 text-center sm:p-12">
          <div className="mb-8 inline-flex items-center justify-center rounded-full border border-amber-200/60 bg-background p-3 text-amber-700 dark:border-amber-500/20 dark:text-amber-300">
            <HugeiconsIcon icon={SentIcon} size={24} />
          </div>
          <h2 className="mb-6 font-bold text-3xl text-foreground sm:text-4xl">
            {t("ctaTitle")}
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            {t("ctaDescription", { userCount })}
          </p>
          <BottomCTAButton />
        </div>
      </div>
    </div>
  )
}

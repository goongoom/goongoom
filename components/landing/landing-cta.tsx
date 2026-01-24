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
        <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-emerald-50 via-sky-50 to-violet-50 p-8 text-center sm:p-12 dark:from-emerald-950/30 dark:via-sky-950/20 dark:to-violet-950/20">
          <div className="mb-8 inline-flex items-center justify-center rounded-full border border-emerald-200/60 bg-white/60 p-3 text-emerald-700 dark:border-emerald-500/20 dark:bg-background/30 dark:text-emerald-300">
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

import {
  Share01Icon,
  ShieldKeyIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

interface LandingFeaturesProps {
  t: (key: string) => string
  tShare: (key: string) => string
}

export function LandingFeatures({ t, tShare }: LandingFeaturesProps) {
  return (
    <div className="border-border border-y bg-muted/40 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <Card className="hover-lift bg-amber-50/40 transition-all duration-200 dark:bg-amber-950/20">
            <div className="h-1 w-full rounded-full bg-amber-500/60" />
            <CardContent className="space-y-4">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <HugeiconsIcon icon={ShieldKeyIcon} size={24} />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">{t("safeAnonymity")}</CardTitle>
                <CardDescription className="text-base">
                  {t("safeAnonymityDescription")}
                </CardDescription>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-sky-50/40 transition-all duration-200 dark:bg-sky-950/20">
            <div className="h-1 w-full rounded-full bg-sky-500/60" />
            <CardContent className="space-y-4">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                <HugeiconsIcon icon={Share01Icon} size={24} />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">{tShare("easyShare")}</CardTitle>
                <CardDescription className="text-base">
                  {tShare("easyShareDescription")}
                </CardDescription>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-violet-50/40 transition-all duration-200 dark:bg-violet-950/20">
            <div className="h-1 w-full rounded-full bg-violet-500/60" />
            <CardContent className="space-y-4">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                <HugeiconsIcon icon={SparklesIcon} size={24} />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">
                  {tShare("instagramShare")}
                </CardTitle>
                <CardDescription className="text-base">
                  {tShare("instagramShareDescription")}
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

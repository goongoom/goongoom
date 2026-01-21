import {
  Message01Icon,
  SentIcon,
  Share01Icon,
  ShieldKeyIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import {
  BottomCTAButton,
  HeroAuthButtons,
} from "@/components/auth/auth-buttons"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { getTotalUserCount } from "@/lib/db/queries"

export default async function Home() {
  const [userCount, t, tNav, tFooter, tShare] = await Promise.all([
    getTotalUserCount(),
    getTranslations("home"),
    getTranslations("nav"),
    getTranslations("footer"),
    getTranslations("share"),
  ])

  return (
    <div className="h-full">
      <div className="relative overflow-hidden pt-32">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-neon-pink/10 blur-3xl filter" />
        <div className="absolute top-48 -left-24 h-72 w-72 rounded-full bg-electric-blue/10 blur-3xl filter" />

        <div className="relative mx-auto max-w-5xl px-6 pb-24 text-center">
          <Badge className="mb-6 gap-2" variant="secondary">
            <span className="size-2 animate-pulse rounded-full bg-neon-pink" />
            <span className="font-semibold text-neon-pink text-xs tracking-wide">
              {t("hotTitle")}
            </span>
          </Badge>

          <h1 className="mb-8 text-balance font-extrabold text-4xl text-foreground leading-tight tracking-tight sm:text-7xl">
            {t("heroTitle")}
          </h1>

          <p className="mx-auto mb-10 max-w-2xl whitespace-pre-line text-lg text-muted-foreground leading-relaxed sm:text-xl">
            {t("heroDescription")}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <HeroAuthButtons />
          </div>
        </div>

        <div className="border-border border-y bg-muted/40 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              <Card>
                <CardContent className="space-y-4">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-electric-blue/10 text-electric-blue">
                    <HugeiconsIcon icon={ShieldKeyIcon} size={24} />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">
                      {t("safeAnonymity")}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {t("safeAnonymityDescription")}
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-neon-pink/10 text-neon-pink">
                    <HugeiconsIcon icon={Share01Icon} size={24} />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">
                      {tShare("easyShare")}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {tShare("easyShareDescription")}
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-lime/10 text-lime">
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

        <div className="relative overflow-hidden py-24">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <div className="mb-8 inline-flex items-center justify-center rounded-full bg-sunset-orange/15 p-3 text-sunset-orange">
              <HugeiconsIcon icon={SentIcon} size={24} />
            </div>
            <h2 className="mb-6 font-bold text-3xl text-foreground sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mb-10 text-lg text-muted-foreground">
              {t("ctaDescription", { userCount: userCount.toLocaleString() })}
            </p>
            <BottomCTAButton />
          </div>
        </div>
      </div>

      <footer className="border-border border-t bg-background py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Message01Icon} size={14} strokeWidth={3} />
            </div>
            <span className="font-semibold text-muted-foreground text-sm">
              {tNav("appName")}
            </span>
          </div>
          <div className="flex gap-6 text-muted-foreground text-sm">
            <Link
              className="inline-flex min-h-11 items-center transition-colors"
              href="#"
            >
              {tFooter("terms")}
            </Link>
            <Link
              className="inline-flex min-h-11 items-center transition-colors"
              href="#"
            >
              {tFooter("privacy")}
            </Link>
            <Link
              className="inline-flex min-h-11 items-center transition-colors"
              href="#"
            >
              {tFooter("contact")}
            </Link>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2026 Goongoom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

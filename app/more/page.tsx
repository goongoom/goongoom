import {
  CustomerServiceIcon,
  GiftIcon,
  Megaphone02Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { getTranslations } from "next-intl/server"
import { MainContent } from "@/components/layout/main-content"
import { Button } from "@/components/ui/button"

export default async function MorePage() {
  const t = await getTranslations("more")

  const moreOptions = [
    { icon: Megaphone02Icon, labelKey: "announcements" as const },
    { icon: GiftIcon, labelKey: "events" as const },
    { icon: CustomerServiceIcon, labelKey: "contact" as const },
    { icon: Settings01Icon, labelKey: "settings" as const },
  ]

  return (
    <MainContent>
      <h1 className="mb-8 font-bold text-3xl text-foreground">{t("title")}</h1>

      <div className="space-y-3">
        {moreOptions.map((option) => {
          const Icon = option.icon
          return (
            <Button
              className="min-h-12 w-full justify-start gap-4"
              key={option.labelKey}
              size="lg"
              variant="outline"
            >
              <HugeiconsIcon
                className="size-5 text-muted-foreground"
                icon={Icon}
              />
              <span className="text-base text-foreground">
                {t(option.labelKey)}
              </span>
            </Button>
          )
        })}
      </div>
    </MainContent>
  )
}

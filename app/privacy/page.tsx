import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { MainContent } from "@/components/layout/main-content"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("footer")
  return {
    title: t("privacy"),
  }
}

export default async function PrivacyPage() {
  const locale = await getLocale()

  const Content =
    locale === "ko"
      ? (await import("@/content/legal/privacy.ko.mdx")).default
      : (await import("@/content/legal/privacy.en.mdx")).default

  return (
    <MainContent>
      <div className="py-4">
        <Content />
      </div>
    </MainContent>
  )
}

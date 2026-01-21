import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { PasskeyNudge } from "@/components/auth/passkey-nudge"
import { MainContent } from "@/components/layout/main-content"
import { ClerkAccountCard } from "@/components/settings/clerk-account-card"
import { LocaleSelector } from "@/components/settings/locale-selector"
import { SettingsForm } from "@/components/settings/settings-form"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { ToastOnMount } from "@/components/ui/toast-on-mount"
import { getClerkUserById } from "@/lib/clerk"
import { getOrCreateUser } from "@/lib/db/queries"
import {
  DEFAULT_QUESTION_SECURITY_LEVEL,
  getQuestionSecurityOptions,
} from "@/lib/question-security"

const URL_PATTERN_REGEX = /:\/\/|\/|instagram\.com|twitter\.com|x\.com|www\./i

function normalizeHandle(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }
  const looksLikeUrl = URL_PATTERN_REGEX.test(trimmed)

  if (!looksLikeUrl) {
    return trimmed
  }

  try {
    const url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    )
    const parts = url.pathname.split("/").filter(Boolean)
    return parts[0] || ""
  } catch {
    return trimmed.split("/").filter(Boolean)[0] || ""
  }
}

interface SettingsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect("/")
  }

  const [clerkUser, dbUser, query, t] = await Promise.all([
    getClerkUserById(clerkId),
    getOrCreateUser(clerkId),
    searchParams,
    getTranslations("settings"),
  ])

  const securityOptions = await getQuestionSecurityOptions()

  const error =
    typeof query?.error === "string" ? decodeURIComponent(query.error) : null

  if (!clerkUser) {
    return (
      <MainContent>
        <h1 className="mb-2 font-bold text-3xl text-foreground">
          {t("title")}
        </h1>
        <p className="mb-8 text-muted-foreground">{t("description")}</p>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t("profileRequired")}</EmptyTitle>
            <EmptyDescription>
              {t("profileRequiredDescription")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </MainContent>
    )
  }

  const initialBio = dbUser?.bio || null
  const initialSocialLinks = dbUser?.socialLinks || null
  const initialQuestionSecurityLevel =
    dbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL

  const instagramHandle = initialSocialLinks?.instagram
    ? normalizeHandle(initialSocialLinks.instagram)
    : ""
  const twitterHandle = initialSocialLinks?.twitter
    ? normalizeHandle(initialSocialLinks.twitter)
    : ""

  return (
    <MainContent>
      <div className="mb-8 animate-slide-up-fade space-y-2">
        <h1 className="font-bold text-3xl text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      {error && <ToastOnMount message={error} type="error" />}

      <div className="space-y-6">
        <div
          className="animate-slide-up-fade"
          style={{ animationDelay: "0.1s" }}
        >
          <PasskeyNudge />
        </div>

        <div
          className="animate-slide-up-fade"
          style={{ animationDelay: "0.15s" }}
        >
          <ClerkAccountCard />
        </div>

        <div
          className="animate-slide-up-fade rounded-2xl border border-border bg-card p-6"
          style={{ animationDelay: "0.2s" }}
        >
          <LocaleSelector />
        </div>

        <div
          className="animate-slide-up-fade rounded-2xl border border-border bg-card p-6"
          style={{ animationDelay: "0.25s" }}
        >
          <SettingsForm
            initialBio={initialBio}
            initialInstagramHandle={instagramHandle}
            initialQuestionSecurityLevel={initialQuestionSecurityLevel}
            initialTwitterHandle={twitterHandle}
            securityOptions={securityOptions}
          />
        </div>
      </div>
    </MainContent>
  )
}

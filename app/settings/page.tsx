import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { PasskeyNudge } from "@/components/auth/passkey-nudge"
import { MainContent } from "@/components/layout/main-content"
import { AccountSettingsButton } from "@/components/settings/account-settings-button"
import { LocaleSelector } from "@/components/settings/locale-selector"
import { LogoutButton } from "@/components/settings/logout-button"
import { ThemeSelector } from "@/components/settings/theme-selector"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { ToastOnMount } from "@/components/ui/toast-on-mount"
import { getClerkUserById } from "@/lib/clerk"

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

  const [clerkUser, query, t] = await Promise.all([
    getClerkUserById(clerkId),
    searchParams,
    getTranslations("settings"),
  ])

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

  return (
    <MainContent>
      <div className="mb-8 space-y-2">
        <h1 className="font-bold text-3xl text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      {error && <ToastOnMount message={error} type="error" />}

      <div className="space-y-6">
        <AccountSettingsButton />

        <PasskeyNudge />

        <div className="rounded-2xl border border-border bg-card p-6">
          <ThemeSelector />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <LocaleSelector />
        </div>

        <LogoutButton />
      </div>
    </MainContent>
  )
}

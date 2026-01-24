import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { MainContent } from "@/components/layout/main-content"
import { ProfileEditForm } from "@/components/settings/profile-edit-form"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { getClerkUserById } from "@/lib/clerk"
import {
  DEFAULT_SIGNATURE_COLOR,
  isValidSignatureColor,
} from "@/lib/colors/signature-colors"
import { getOrCreateUser } from "@/lib/db/queries"
import { getQuestionSecurityOptions } from "@/lib/question-security"

export default async function ProfileSettingsPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect("/")
  }

  const [clerkUser, dbUser, t, securityOptions] = await Promise.all([
    getClerkUserById(clerkId),
    getOrCreateUser(clerkId),
    getTranslations("settings"),
    getQuestionSecurityOptions(),
  ])

  if (!clerkUser) {
    return (
      <MainContent>
        <h1 className="mb-2 font-bold text-3xl text-foreground">
          {t("profileSettings")}
        </h1>
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

  const initialSocialLinks = dbUser?.socialLinks || null
  const securityLevel = dbUser?.questionSecurityLevel || "public"
  const signatureColor =
    dbUser?.signatureColor && isValidSignatureColor(dbUser.signatureColor)
      ? dbUser.signatureColor
      : DEFAULT_SIGNATURE_COLOR

  return (
    <MainContent>
      <div className="mb-8 space-y-2">
        <h1 className="font-bold text-3xl text-foreground">
          {t("profileSettings")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("profileSettingsDescription")}
        </p>
      </div>

      <ProfileEditForm
        initialBio={dbUser?.bio || null}
        initialQuestionSecurityLevel={securityLevel}
        initialSignatureColor={signatureColor}
        initialSocialLinks={initialSocialLinks}
        securityOptions={securityOptions}
      />
    </MainContent>
  )
}

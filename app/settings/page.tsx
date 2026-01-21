import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { PasskeyNudge } from "@/components/auth/passkey-nudge"
import { MainContent } from "@/components/layout/main-content"
import { ClerkAccountCard } from "@/components/settings/clerk-account-card"
import { LocaleSelector } from "@/components/settings/locale-selector"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ToastOnMount } from "@/components/ui/toast-on-mount"
import { updateProfile } from "@/lib/actions/profile"
import { getClerkUserById } from "@/lib/clerk"
import { getOrCreateUser } from "@/lib/db/queries"
import {
  DEFAULT_QUESTION_SECURITY_LEVEL,
  getQuestionSecurityOptions,
  isQuestionSecurityLevel,
  QUESTION_SECURITY_LEVELS,
} from "@/lib/question-security"
import type { SocialLinks } from "@/lib/types"

interface SettingsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

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

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect("/")
  }

  const [clerkUser, dbUser, query, t, tCommon] = await Promise.all([
    getClerkUserById(clerkId),
    getOrCreateUser(clerkId),
    searchParams,
    getTranslations("settings"),
    getTranslations("common"),
  ])

  const securityOptions = await getQuestionSecurityOptions()

  const error =
    typeof query?.error === "string" ? decodeURIComponent(query.error) : null
  const updated = query?.updated === "1"

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

  async function submitProfile(formData: FormData) {
    "use server"

    const tErrors = await getTranslations("errors")

    const normalizeHandle = (value: string) => {
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

    const bio = String(formData.get("bio") || "").trim()
    const instagram = normalizeHandle(String(formData.get("instagram") || ""))
    const twitter = normalizeHandle(String(formData.get("twitter") || ""))
    const securityLevel = String(
      formData.get("questionSecurityLevel") || DEFAULT_QUESTION_SECURITY_LEVEL
    )

    if (!isQuestionSecurityLevel(securityLevel)) {
      redirect(
        `/settings?error=${encodeURIComponent(tErrors("invalidSecuritySetting"))}`
      )
    }

    const links: SocialLinks = {}
    if (instagram) {
      links.instagram = instagram
    }
    if (twitter) {
      links.twitter = twitter
    }

    const result = await updateProfile({
      bio: bio || null,
      socialLinks: Object.keys(links).length ? links : null,
      questionSecurityLevel: securityLevel,
    })

    if (!result.success) {
      redirect(`/settings?error=${encodeURIComponent(result.error)}`)
    }

    revalidatePath("/settings")
    redirect("/settings?updated=1")
  }

  return (
    <MainContent>
      <h1 className="mb-2 font-bold text-3xl text-foreground">{t("title")}</h1>
      <p className="mb-8 text-muted-foreground">{t("description")}</p>

      {error && <ToastOnMount message={error} type="error" />}
      {updated && <ToastOnMount message={t("profileUpdated")} type="success" />}

      <PasskeyNudge />

      <ClerkAccountCard />

      <div className="space-y-4 border-border border-b pb-6">
        <LocaleSelector />
      </div>

      <form action={submitProfile} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-medium text-base text-foreground">
              {t("anonymousRestriction")}
            </h3>
            <p className="text-muted-foreground text-xs">
              {t("anonymousRestrictionDescription")}
            </p>
          </div>

          <Field>
            <FieldLabel>{t("whoCanAsk")}</FieldLabel>
            <FieldContent>
              <RadioGroup
                className="w-full"
                defaultValue={initialQuestionSecurityLevel}
                name="questionSecurityLevel"
              >
                {QUESTION_SECURITY_LEVELS.map((level) => {
                  const option = securityOptions[level]
                  return (
                    <Label
                      className="flex items-start gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[data-checked]:border-primary/48 has-[data-checked]:bg-accent/50"
                      key={level}
                    >
                      <RadioGroupItem id={`qsl-${level}`} value={level} />
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-foreground">
                          {option.label}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {option.description}
                        </p>
                      </div>
                    </Label>
                  )
                })}
              </RadioGroup>
            </FieldContent>
          </Field>
        </div>

        <div className="space-y-4 border-border border-t pt-6">
          <div className="space-y-1">
            <h3 className="font-medium text-base text-foreground">
              {t("profileSettings")}
            </h3>
            <p className="text-muted-foreground text-xs">
              {t("profileSettingsDescription")}
            </p>
          </div>

          <Field>
            <FieldLabel htmlFor="bio">{t("bioLabel")}</FieldLabel>
            <Textarea
              defaultValue={initialBio || ""}
              id="bio"
              name="bio"
              placeholder={t("bioPlaceholder")}
              rows={4}
            />
          </Field>

          <div className="space-y-4 pt-2">
            <p className="text-muted-foreground text-xs">{t("socialLinks")}</p>

            <Field>
              <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
              <FieldContent>
                <Input
                  autoCapitalize="none"
                  autoCorrect="off"
                  defaultValue={instagramHandle}
                  id="instagram"
                  name="instagram"
                  placeholder="username"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="twitter">Twitter / X</FieldLabel>
              <FieldContent>
                <Input
                  autoCapitalize="none"
                  autoCorrect="off"
                  defaultValue={twitterHandle}
                  id="twitter"
                  name="twitter"
                  placeholder="username"
                />
              </FieldContent>
            </Field>
          </div>
        </div>

        <Button className="w-full" type="submit">
          {tCommon("save")}
        </Button>
      </form>
    </MainContent>
  )
}

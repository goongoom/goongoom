import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { PasskeyNudge } from "@/components/auth/passkey-nudge"
import { MainContent } from "@/components/layout/main-content"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { updateProfile } from "@/lib/actions/profile"
import { getClerkUserById } from "@/lib/clerk"
import { getOrCreateUser } from "@/lib/db/queries"
import {
  DEFAULT_QUESTION_SECURITY_LEVEL,
  isQuestionSecurityLevel,
  QUESTION_SECURITY_LEVELS,
  QUESTION_SECURITY_OPTIONS,
} from "@/lib/question-security"
import type { SocialLinks } from "@/lib/types"

interface SettingsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const URL_PATTERN_REGEX =
  /:\/\/|\/|instagram\.com|github\.com|twitter\.com|x\.com|www\./i

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

async function SettingsContent({
  searchParamsPromise,
}: {
  searchParamsPromise?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect("/")
  }

  const [clerkUser, dbUser, query] = await Promise.all([
    getClerkUserById(clerkId),
    getOrCreateUser(clerkId),
    searchParamsPromise,
  ])

  const error =
    typeof query?.error === "string" ? decodeURIComponent(query.error) : null
  const updated = query?.updated === "1"

  if (!clerkUser) {
    return (
      <MainContent>
        <h1 className="mb-2 font-bold text-3xl text-foreground">설정</h1>
        <p className="mb-8 text-muted-foreground">프로필 정보를 수정하세요</p>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>프로필 설정이 필요합니다</EmptyTitle>
            <EmptyDescription>계정 설정을 완료해주세요.</EmptyDescription>
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
  const githubHandle = initialSocialLinks?.github
    ? normalizeHandle(initialSocialLinks.github)
    : ""
  const twitterHandle = initialSocialLinks?.twitter
    ? normalizeHandle(initialSocialLinks.twitter)
    : ""

  async function submitProfile(formData: FormData) {
    "use server"

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
    const github = normalizeHandle(String(formData.get("github") || ""))
    const twitter = normalizeHandle(String(formData.get("twitter") || ""))
    const securityLevel = String(
      formData.get("questionSecurityLevel") || DEFAULT_QUESTION_SECURITY_LEVEL
    )

    if (!isQuestionSecurityLevel(securityLevel)) {
      redirect(
        `/settings?error=${encodeURIComponent("질문 보안 설정이 올바르지 않습니다")}`
      )
    }

    const links: SocialLinks = {}
    if (instagram) {
      links.instagram = instagram
    }
    if (github) {
      links.github = github
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
      <h1 className="mb-2 font-bold text-3xl text-foreground">설정</h1>
      <p className="mb-8 text-muted-foreground">프로필 정보를 수정하세요</p>

      {(error || updated) && (
        <Alert className="mb-6" variant={error ? "destructive" : "default"}>
          <AlertDescription className="text-center">
            {error || "프로필이 수정되었습니다!"}
          </AlertDescription>
        </Alert>
      )}

      <PasskeyNudge />

      <form action={submitProfile} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-medium text-base text-foreground">계정 설정</h3>
            <p className="text-muted-foreground text-xs">
              프로필 정보와 소셜 링크를 설정하세요.
            </p>
          </div>

          <Field>
            <FieldLabel htmlFor="bio">소개</FieldLabel>
            <Textarea
              defaultValue={initialBio || ""}
              id="bio"
              name="bio"
              placeholder="자기소개를 입력하세요…"
              rows={4}
            />
          </Field>

          <div className="space-y-4 pt-2">
            <p className="text-muted-foreground text-xs">
              소셜 링크 (사용자 이름만 입력)
            </p>

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
              <FieldLabel htmlFor="github">GitHub</FieldLabel>
              <FieldContent>
                <Input
                  autoCapitalize="none"
                  autoCorrect="off"
                  defaultValue={githubHandle}
                  id="github"
                  name="github"
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

        <div className="space-y-4 border-border border-t pt-6">
          <div className="space-y-1">
            <h3 className="font-medium text-base text-foreground">질문 설정</h3>
            <p className="text-muted-foreground text-xs">
              익명 질문을 제한해 악성 질문을 줄일 수 있습니다.
            </p>
          </div>

          <Field>
            <FieldLabel>질문 보안 수준</FieldLabel>
            <FieldContent>
              <RadioGroup
                className="w-full"
                defaultValue={initialQuestionSecurityLevel}
                name="questionSecurityLevel"
              >
                {QUESTION_SECURITY_LEVELS.map((level) => {
                  const option = QUESTION_SECURITY_OPTIONS[level]
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

        <Button className="w-full" type="submit">
          저장하기
        </Button>
      </form>
    </MainContent>
  )
}

export default function SettingsPage({ searchParams }: SettingsPageProps) {
  return (
    <Suspense fallback={null}>
      <SettingsContent searchParamsPromise={searchParams} />
    </Suspense>
  )
}

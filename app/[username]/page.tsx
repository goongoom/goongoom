import { auth } from "@clerk/nextjs/server"
import { FacebookIcon, InstagramIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { MainContent } from "@/components/layout/main-content"
import { ClampedAnswer } from "@/components/questions/clamped-answer"
import { CopyLinkButton } from "@/components/questions/copy-link-button"
import { QuestionDrawer } from "@/components/questions/question-drawer"
import { ShareInstagramButton } from "@/components/questions/share-instagram-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { ToastOnMount } from "@/components/ui/toast-on-mount"
import { createQuestion } from "@/lib/actions/questions"
import { getClerkUserByUsername } from "@/lib/clerk"
import { getOrCreateUser, getUserWithAnsweredQuestions } from "@/lib/db/queries"
import { DEFAULT_QUESTION_SECURITY_LEVEL } from "@/lib/question-security"
import type { QuestionWithAnswers } from "@/lib/types"
import { formatRelativeTime } from "@/lib/utils/format-time"

interface UserProfilePageProps {
  params: Promise<{ username: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const HTTPS_PROTOCOL_REGEX = /^https?:\/\//i
const LEADING_SLASHES_REGEX = /^\/+/

function toProfileUrl(value: string | undefined, domain: string) {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  if (HTTPS_PROTOCOL_REGEX.test(trimmed)) {
    return trimmed
  }
  if (trimmed.includes(domain)) {
    return `https://${trimmed.replace(LEADING_SLASHES_REGEX, "")}`
  }
  const handle = trimmed.split("/")[0]
  return handle ? `https://${domain}/${handle}` : null
}

function buildShareUrl({
  question,
  answer,
  name,
}: {
  question: string
  answer: string
  name: string
}) {
  const normalize = (value: string, max: number) =>
    value.length > max ? `${value.slice(0, max - 1)}…` : value
  const params = new URLSearchParams({
    question: normalize(question, 160),
    answer: normalize(answer, 260),
    name: normalize(name, 40),
  })
  return `/api/instagram?${params.toString()}`
}

export default async function UserProfilePage({
  params,
  searchParams,
}: UserProfilePageProps) {
  const [{ username }, query = {}, { userId: viewerId }] = (await Promise.all([
    params,
    searchParams,
    auth(),
  ])) as [
    { username: string },
    Record<string, string | string[] | undefined> | undefined,
    { userId: string | null },
  ]

  const clerkUser = await getClerkUserByUsername(username)

  if (!clerkUser) {
    notFound()
  }

  const [
    dbUser,
    { answeredQuestions },
    t,
    tCommon,
    tRestrictions,
    ,
    tAnswers,
    locale,
  ] = await Promise.all([
    getOrCreateUser(clerkUser.clerkId),
    getUserWithAnsweredQuestions(clerkUser.clerkId),
    getTranslations("questions"),
    getTranslations("common"),
    getTranslations("restrictions"),
    getTranslations("errors"),
    getTranslations("answers"),
    getLocale(),
  ])

  const fullName = clerkUser.displayName || clerkUser.username || username
  const displayName = fullName.split(" ")[0] || fullName

  const error =
    typeof query?.error === "string" ? decodeURIComponent(query.error) : null
  const sent = query?.sent === "1"

  const getStatus = () => {
    if (error) {
      return { type: "error" as const, message: error }
    }
    if (sent) {
      return { type: "success" as const, message: t("questionSent") }
    }
    return null
  }
  const status = getStatus()

  const socialLinks = [
    {
      key: "instagram",
      label: "Instagram",
      icon: InstagramIcon,
      href: toProfileUrl(dbUser?.socialLinks?.instagram, "instagram.com"),
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: FacebookIcon,
      href: toProfileUrl(dbUser?.socialLinks?.facebook, "facebook.com"),
    },
  ].filter((link) => Boolean(link.href))

  const securityLevel =
    dbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL
  const viewerIsVerified = Boolean(viewerId)
  const canAskAnonymously =
    securityLevel !== "public_only" &&
    (securityLevel === "anyone" || viewerIsVerified)
  const canAskPublic = viewerIsVerified
  const showSecurityNotice =
    securityLevel === "verified_anonymous" ||
    securityLevel === "public_only" ||
    (!viewerIsVerified && securityLevel === "anyone")
  const getSecurityNotice = () => {
    if (securityLevel === "verified_anonymous") {
      return tRestrictions("anonymousLoginRequired")
    }
    if (securityLevel === "public_only") {
      return tRestrictions("identifiedOnly")
    }
    return tRestrictions("loginForIdentified")
  }
  const securityNotice = getSecurityNotice()

  const recipientClerkId = clerkUser.clerkId
  const recipientUsername = clerkUser.username || username

  async function submitQuestion(formData: FormData) {
    "use server"
    const tErrors = await getTranslations("errors")
    const content = String(formData.get("question") || "").trim()
    const questionType = String(formData.get("questionType") || "anonymous")

    if (!content) {
      redirect(
        `/${recipientUsername}?error=${encodeURIComponent(tErrors("pleaseEnterQuestion"))}`
      )
    }

    const result = await createQuestion({
      recipientClerkId,
      content,
      isAnonymous: questionType !== "public",
    })

    if (!result.success) {
      redirect(
        `/${recipientUsername}?error=${encodeURIComponent(result.error)}`
      )
    }

    revalidatePath(`/${recipientUsername}`)
    redirect(`/${recipientUsername}?sent=1`)
  }

  const requiresSignIn = !viewerIsVerified && securityLevel !== "anyone"

  const tProfile = await getTranslations("profile")

  return (
    <MainContent>
      <Card className="mb-6">
        <CardContent className="flex items-center gap-6">
          <Avatar className="size-24 ring-2 ring-primary/30">
            {clerkUser.avatarUrl ? (
              <AvatarImage alt={displayName} src={clerkUser.avatarUrl} />
            ) : null}
            <AvatarFallback>{displayName[0] || "?"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1">
            <h1 className="font-semibold text-foreground text-xl">
              {displayName}
            </h1>
            <p className="text-muted-foreground text-sm">
              {clerkUser.username || username}
            </p>
            <p className="mt-1 text-sm">
              {dbUser?.bio || (
                <span className="text-muted-foreground">
                  {tProfile("noBio")}
                </span>
              )}
            </p>
          </div>
        </CardContent>
        {socialLinks.length > 0 && (
          <CardContent className="flex flex-wrap gap-4 pt-0">
            {socialLinks.map((link) => {
              const Icon = link.icon
              return (
                <div
                  className="flex flex-col items-center gap-2"
                  key={link.key}
                >
                  <Button
                    aria-label={link.label}
                    className="rounded-full"
                    render={
                      <Link
                        href={link.href as string}
                        rel="noopener noreferrer"
                        target="_blank"
                      />
                    }
                    size="icon"
                    variant="ghost"
                  >
                    <HugeiconsIcon className="size-4" icon={Icon} />
                  </Button>
                  <span className="text-muted-foreground text-xs">
                    {link.label}
                  </span>
                </div>
              )
            })}
          </CardContent>
        )}
      </Card>

      {status && (
        <ToastOnMount
          message={status.message}
          type={status.type === "error" ? "error" : "success"}
        />
      )}

      {answeredQuestions.length > 0 ? (
        <div className="space-y-6 pb-24">
          {answeredQuestions.map((qa) => {
            const answer = (qa as QuestionWithAnswers).answers[0]
            if (!answer) {
              return null
            }
            const shareUrl = buildShareUrl({
              question: qa.content,
              answer: answer.content,
              name: displayName,
            })
            return (
              <Link
                className="block"
                href={`/${username}/q/${qa.id}`}
                key={qa.id}
                prefetch={false}
              >
                <Card className="group relative transition-colors hover:bg-muted/50">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <CopyLinkButton url={`/${username}/q/${qa.id}`} />
                    <ShareInstagramButton shareUrl={shareUrl} />
                  </div>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex w-full items-start gap-3">
                      <Avatar className="size-10 flex-shrink-0">
                        <AvatarImage
                          alt="Avatar"
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=anon_${qa.id}`}
                        />
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <Card className="max-w-prose bg-muted/40 px-4 py-3">
                          <p className="text-foreground leading-relaxed">
                            {qa.content}
                          </p>
                        </Card>
                        <p className="mt-1 ml-1 text-muted-foreground text-xs">
                          {qa.isAnonymous === 1
                            ? tCommon("anonymous")
                            : tCommon("identified")}{" "}
                          · {formatRelativeTime(qa.createdAt, locale)}{" "}
                          {t("questionLabel")}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full items-start justify-end gap-3">
                      <div className="flex flex-1 flex-col items-end">
                        <Card className="max-w-prose border-primary/20 bg-primary px-4 py-3 text-primary-foreground">
                          <ClampedAnswer content={answer.content} />
                        </Card>
                        <p className="mt-1 mr-1 text-muted-foreground text-xs">
                          {displayName} ·{" "}
                          {formatRelativeTime(answer.createdAt, locale)}{" "}
                          {tAnswers("answer")}
                        </p>
                      </div>
                      <Avatar className="size-10 flex-shrink-0">
                        {clerkUser.avatarUrl ? (
                          <AvatarImage
                            alt={displayName}
                            src={clerkUser.avatarUrl}
                          />
                        ) : null}
                        <AvatarFallback>{displayName[0] || "?"}</AvatarFallback>
                      </Avatar>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Empty className="pb-24">
          <EmptyHeader>
            <EmptyTitle className="text-muted-foreground">
              {tAnswers("noAnswersYet")}
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}

      <QuestionDrawer
        canAskAnonymously={canAskAnonymously}
        canAskPublic={canAskPublic}
        recipientClerkId={recipientClerkId}
        recipientName={displayName}
        requiresSignIn={requiresSignIn}
        securityNotice={securityNotice}
        showSecurityNotice={showSecurityNotice}
        submitAction={submitQuestion}
      />
    </MainContent>
  )
}

import { auth } from "@clerk/nextjs/server"
import {
  Message01Icon,
  SentIcon,
  Share01Icon,
  ShieldKeyIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import {
  BottomCTAButton,
  HeroAuthButtons,
} from "@/components/auth/auth-buttons"
import { MainContent } from "@/components/layout/main-content"
import { ProfileActions } from "@/components/profile/profile-actions"
import { ProfileEditDrawer } from "@/components/profile/profile-edit-drawer"
import { AnsweredQuestionCard } from "@/components/questions/answered-question-card"
import { QuestionDrawer } from "@/components/questions/question-drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { ToastOnMount } from "@/components/ui/toast-on-mount"
import { createQuestion } from "@/lib/actions/questions"
import { getClerkUserById } from "@/lib/clerk"
import {
  getOrCreateUser,
  getUserCount,
  getUserWithAnsweredQuestions,
} from "@/lib/db/queries"
import {
  DEFAULT_QUESTION_SECURITY_LEVEL,
  getQuestionSecurityOptions,
} from "@/lib/question-security"
import {
  buildSocialLinks,
  getPageStatus,
  normalizeHandle,
} from "@/lib/utils/social-links"

interface HomePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function Home({ searchParams }: HomePageProps) {
  const { userId: clerkId } = await auth()

  if (clerkId) {
    return <MyProfile clerkId={clerkId} searchParams={searchParams} />
  }

  return <LandingPage />
}

async function LandingPage() {
  const [t, tNav, tFooter, tShare, userCount] = await Promise.all([
    getTranslations("home"),
    getTranslations("nav"),
    getTranslations("footer"),
    getTranslations("share"),
    getUserCount(),
  ])

  return (
    <div className="flex-1">
      <div className="relative overflow-hidden pt-16 md:pt-32">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-neon-pink/10 blur-3xl filter" />
        <div className="absolute top-48 -left-24 h-72 w-72 rounded-full bg-electric-blue/10 blur-3xl filter" />

        <div className="relative mx-auto max-w-5xl px-6 pb-24 text-center">
          <Badge className="mb-6 gap-2" variant="secondary">
            <span className="size-2 rounded-full bg-neon-pink" />
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
              {t("ctaDescription", { userCount })}
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
              className="inline-flex min-h-11 items-center rounded transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              href="/terms"
            >
              {tFooter("terms")}
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              href="/privacy"
            >
              {tFooter("privacy")}
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              href="/contact"
            >
              {tFooter("contact")}
            </Link>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2026 궁금닷컴. 모든 권리 보유.
          </div>
        </div>
      </footer>
    </div>
  )
}

interface MyProfileProps {
  clerkId: string
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

async function MyProfile({ clerkId, searchParams }: MyProfileProps) {
  const [clerkUser, query, securityOptions] = await Promise.all([
    getClerkUserById(clerkId),
    searchParams,
    getQuestionSecurityOptions(),
  ])

  if (!clerkUser?.username) {
    redirect("/settings")
  }

  const [
    dbUser,
    { answeredQuestions },
    t,
    tCommon,
    tAnswers,
    tProfile,
    locale,
  ] = await Promise.all([
    getOrCreateUser(clerkId),
    getUserWithAnsweredQuestions(clerkId),
    getTranslations("questions"),
    getTranslations("common"),
    getTranslations("answers"),
    getTranslations("profile"),
    getLocale(),
  ])

  const displayName =
    clerkUser.displayName?.split(" ")[0] ||
    clerkUser.displayName ||
    clerkUser.username

  const error =
    typeof query?.error === "string" ? decodeURIComponent(query.error) : null
  const sent = query?.sent === "1"

  const status = getPageStatus(error, sent, t("questionSent"))
  const socialLinks = buildSocialLinks(dbUser?.socialLinks)

  const securityLevel =
    dbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL

  const instagramHandle = dbUser?.socialLinks?.instagram
    ? normalizeHandle(dbUser.socialLinks.instagram)
    : ""
  const twitterHandle = dbUser?.socialLinks?.twitter
    ? normalizeHandle(dbUser.socialLinks.twitter)
    : ""

  const questionsWithAnswers = answeredQuestions
    .map((qa) => (qa.answer ? { ...qa, firstAnswer: qa.answer } : null))
    .filter((qa) => qa !== null)

  const cardLabels = {
    anonymous: tCommon("anonymous"),
    identified: tCommon("identified"),
    question: t("questionLabel"),
    answer: tAnswers("answer"),
  }

  const recipientClerkId = clerkId

  async function submitQuestion(formData: FormData) {
    "use server"
    const tErrors = await getTranslations("errors")
    const content = String(formData.get("question") || "").trim()
    const questionType = String(formData.get("questionType") || "anonymous")

    if (!content) {
      redirect(`/?error=${encodeURIComponent(tErrors("pleaseEnterQuestion"))}`)
    }

    const result = await createQuestion({
      recipientClerkId,
      content,
      isAnonymous: questionType !== "public",
    })

    if (!result.success) {
      redirect(`/?error=${encodeURIComponent(result.error)}`)
    }

    revalidatePath("/")
    redirect("/?sent=1")
  }

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
              @{clerkUser.username}
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
            {socialLinks.map((link) => (
              <Button
                aria-label={link.label}
                className="rounded-full"
                key={link.key}
                render={
                  <Link
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  />
                }
                size="icon"
                variant="outline"
              >
                <HugeiconsIcon className="size-4" icon={link.icon} />
              </Button>
            ))}
          </CardContent>
        )}
        <CardContent className="pt-0">
          <ProfileActions
            editButton={
              <ProfileEditDrawer
                initialBio={dbUser?.bio || null}
                initialInstagramHandle={instagramHandle}
                initialQuestionSecurityLevel={securityLevel}
                initialTwitterHandle={twitterHandle}
                securityOptions={securityOptions}
              />
            }
            username={clerkUser.username}
          />
        </CardContent>
      </Card>

      {status && <ToastOnMount message={status.message} type={status.type} />}

      {questionsWithAnswers.length > 0 ? (
        <div className="space-y-6 pb-24">
          {questionsWithAnswers.map((qa) => (
            <AnsweredQuestionCard
              answerContent={qa.firstAnswer.content}
              answerCreatedAt={qa.firstAnswer._creationTime}
              avatarUrl={clerkUser.avatarUrl}
              displayName={displayName}
              isAnonymous={qa.isAnonymous}
              key={qa._id}
              labels={cardLabels}
              locale={locale}
              questionContent={qa.content}
              questionCreatedAt={qa._creationTime}
              questionId={qa._id}
              username={clerkUser.username as string}
            />
          ))}
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
        canAskAnonymously={securityLevel !== "public_only"}
        canAskPublic={true}
        recipientClerkId={recipientClerkId}
        recipientName={displayName}
        requiresSignIn={false}
        submitAction={submitQuestion}
      />
    </MainContent>
  )
}

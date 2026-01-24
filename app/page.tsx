import { auth } from "@clerk/nextjs/server"
import { HugeiconsIcon } from "@hugeicons/react"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { LandingCTA } from "@/components/landing/landing-cta"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHero } from "@/components/landing/landing-hero"
import { MainContent } from "@/components/layout/main-content"
import { EditProfileButton } from "@/components/profile/edit-profile-button"
import { ProfileActions } from "@/components/profile/profile-actions"
import { AnsweredQuestionCard } from "@/components/questions/answered-question-card"
import { QuestionDrawer } from "@/components/questions/question-drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { ToastOnMount } from "@/components/ui/toast-on-mount"
import { createQuestion } from "@/lib/actions/questions"
import { getClerkUserById } from "@/lib/clerk"
import {
  getOrCreateUser,
  getUserCount,
  getUserWithAnsweredQuestions,
} from "@/lib/db/queries"
import { DEFAULT_QUESTION_SECURITY_LEVEL } from "@/lib/question-security"
import { buildSocialLinks } from "@/lib/utils/social-links"

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
  const [t, tNav, tFooter, tLegal, tShare, userCount] = await Promise.all([
    getTranslations("home"),
    getTranslations("nav"),
    getTranslations("footer"),
    getTranslations("legal"),
    getTranslations("share"),
    getUserCount(),
  ])

  return (
    <div className="flex-1">
      <LandingHero t={t} />
      <LandingFeatures t={t} tShare={tShare} />
      <LandingCTA t={t} userCount={userCount} />
      <LandingFooter tFooter={tFooter} tLegal={tLegal} tNav={tNav} />
    </div>
  )
}

interface MyProfileProps {
  clerkId: string
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

async function MyProfile({ clerkId, searchParams }: MyProfileProps) {
  const [clerkUser, query] = await Promise.all([
    getClerkUserById(clerkId),
    searchParams,
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

  const displayName = clerkUser.displayName || clerkUser.username

  const error =
    typeof query?.error === "string" ? decodeURIComponent(query.error) : null
  const status = error ? { type: "error" as const, message: error } : null
  const socialLinks = buildSocialLinks(dbUser?.socialLinks)

  const securityLevel =
    dbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL

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
      return { success: false, error: tErrors("pleaseEnterQuestion") }
    }

    const result = await createQuestion({
      recipientClerkId,
      content,
      isAnonymous: questionType !== "public",
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath("/")
    return { success: true }
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
            editButton={<EditProfileButton />}
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
        successMessage={t("questionSent")}
      />
    </MainContent>
  )
}

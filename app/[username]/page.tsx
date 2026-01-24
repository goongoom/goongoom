import { auth } from "@clerk/nextjs/server"
import { HugeiconsIcon } from "@hugeicons/react"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
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
import { getClerkUserByUsername, getClerkUsersByIds } from "@/lib/clerk"
import { getOrCreateUser, getUserWithAnsweredQuestions } from "@/lib/db/queries"
import { DEFAULT_QUESTION_SECURITY_LEVEL } from "@/lib/question-security"
import {
  buildSocialLinks,
  canAskAnonymousQuestion,
} from "@/lib/utils/social-links"

interface UserProfilePageProps {
  params: Promise<{ username: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function UserProfilePage({
  params,
  searchParams,
}: UserProfilePageProps) {
  const { username } = await params
  const query = await searchParams
  const { userId: viewerId } = await auth()

  const clerkUser = await getClerkUserByUsername(username)
  if (!clerkUser) {
    notFound()
  }

  const isOwnProfile = viewerId === clerkUser.clerkId

  const [
    dbUser,
    { answeredQuestions },
    t,
    tCommon,
    ,
    tAnswers,
    locale,
    tProfile,
    tSocial,
  ] = await Promise.all([
    getOrCreateUser(clerkUser.clerkId),
    getUserWithAnsweredQuestions(clerkUser.clerkId),
    getTranslations("questions"),
    getTranslations("common"),
    getTranslations("errors"),
    getTranslations("answers"),
    getLocale(),
    getTranslations("profile"),
    getTranslations("social"),
  ])

  const displayName = clerkUser.displayName || clerkUser.username || username
  const recipientClerkId = clerkUser.clerkId
  const recipientUsername = clerkUser.username || username

  const error =
    typeof query?.error === "string" ? decodeURIComponent(query.error) : null
  const status = error ? { type: "error" as const, message: error } : null

  const socialLinks = buildSocialLinks(dbUser?.socialLinks, {
    instagram: tSocial("instagram"),
    twitter: tSocial("twitter"),
    youtube: tSocial("youtube"),
    github: tSocial("github"),
    naverBlog: tSocial("naverBlog"),
  })

  const securityLevel =
    dbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL
  const viewerIsVerified = Boolean(viewerId)
  const canAskAnonymously = canAskAnonymousQuestion(
    securityLevel,
    viewerIsVerified
  )
  const requiresSignIn = !viewerIsVerified && securityLevel !== "anyone"

  async function submitQuestion(formData: FormData) {
    "use server"
    const tErrors = await getTranslations("errors")
    const content = String(formData.get("question") || "").trim()
    const questionType = String(formData.get("questionType") || "anonymous")
    const avatarSeed = String(formData.get("avatarSeed") || "")

    if (!content) {
      return { success: false, error: tErrors("pleaseEnterQuestion") }
    }

    const isAnonymous = questionType !== "public"
    const result = await createQuestion({
      recipientClerkId,
      content,
      isAnonymous,
      anonymousAvatarSeed: isAnonymous && avatarSeed ? avatarSeed : undefined,
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath(`/${recipientUsername}`)
    return { success: true }
  }

  const senderIds = Array.from(
    new Set(
      answeredQuestions
        .filter((qa) => qa.answer && !qa.isAnonymous && qa.senderClerkId)
        .map((qa) => qa.senderClerkId)
        .filter((id): id is string => Boolean(id))
    )
  )
  const senderMap = await getClerkUsersByIds(senderIds)

  const questionsWithAnswers = answeredQuestions
    .map((qa) => {
      if (!qa.answer) {
        return null
      }
      const sender =
        !qa.isAnonymous && qa.senderClerkId
          ? senderMap.get(qa.senderClerkId)
          : null
      return {
        ...qa,
        firstAnswer: qa.answer,
        senderName: sender?.displayName || sender?.username || null,
        senderAvatarUrl: sender?.avatarUrl || null,
      }
    })
    .filter((qa) => qa !== null)

  const cardLabels = {
    anonymous: tCommon("anonymous"),
    identified: tCommon("identified"),
    question: t("questionLabel"),
    answer: tAnswers("answer"),
  }

  return (
    <MainContent>
      <Card className="mb-6">
        <CardContent className="flex items-center gap-6">
          <Avatar
            className="size-24 ring-2 ring-primary/30"
            key={clerkUser.avatarUrl}
          >
            {clerkUser.avatarUrl && (
              <AvatarImage alt={displayName} src={clerkUser.avatarUrl} />
            )}
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
          <CardContent className="flex flex-wrap gap-2 pt-0">
            {socialLinks.map((link) => (
              <Button
                aria-label={link.label}
                className="h-8 gap-1.5 rounded-full px-3"
                key={link.key}
                render={
                  <Link
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  />
                }
                size="sm"
                variant="outline"
              >
                <HugeiconsIcon className="size-4" icon={link.icon} />
                <span className="text-sm">{link.text}</span>
              </Button>
            ))}
          </CardContent>
        )}
        {isOwnProfile && (
          <CardContent className="pt-0">
            <ProfileActions
              editButton={<EditProfileButton />}
              username={recipientUsername}
            />
          </CardContent>
        )}
      </Card>

      {status && <ToastOnMount message={status.message} type={status.type} />}

      {questionsWithAnswers.length > 0 ? (
        <div className="space-y-6 pb-24">
          {questionsWithAnswers.map((qa) => (
            <AnsweredQuestionCard
              anonymousAvatarSeed={qa.anonymousAvatarSeed}
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
              senderAvatarUrl={qa.senderAvatarUrl}
              senderName={qa.senderName || undefined}
              username={username}
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
        canAskAnonymously={canAskAnonymously}
        canAskPublic={viewerIsVerified}
        recipientClerkId={recipientClerkId}
        recipientName={displayName}
        requiresSignIn={requiresSignIn}
        submitAction={submitQuestion}
        successMessage={t("questionSent")}
      />
    </MainContent>
  )
}

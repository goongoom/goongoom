import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { MainContent } from "@/components/layout/main-content"
import { AnsweredQuestionCard } from "@/components/questions/answered-question-card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { getClerkUsersByIds } from "@/lib/clerk"
import { getFriendsAnswers } from "@/lib/db/queries"

export default async function FriendsPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect("/")
  }

  const [friendsAnswers, t, tCommon, tAnswers, locale] = await Promise.all([
    getFriendsAnswers(clerkId, 30),
    getTranslations("friends"),
    getTranslations("common"),
    getTranslations("answers"),
    getLocale(),
  ])

  const recipientIds = [
    ...new Set(friendsAnswers.map((qa) => qa.recipientClerkId)),
  ]
  const senderIds = [
    ...new Set(
      friendsAnswers
        .filter((qa) => !qa.question.isAnonymous && qa.question.senderClerkId)
        .map((qa) => qa.question.senderClerkId)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  const [recipientMap, senderMap] = await Promise.all([
    getClerkUsersByIds(recipientIds),
    getClerkUsersByIds(senderIds),
  ])

  const cardLabels = {
    anonymous: tCommon("anonymous"),
    identified: tCommon("identified"),
    question: t("questionLabel"),
    answer: tAnswers("answer"),
  }

  const questionsWithInfo = friendsAnswers
    .map((qa) => {
      const recipient = recipientMap.get(qa.recipientClerkId)
      if (!recipient?.username) {
        return null
      }

      const sender =
        !qa.question.isAnonymous && qa.question.senderClerkId
          ? senderMap.get(qa.question.senderClerkId)
          : null

      return {
        ...qa,
        recipientUsername: recipient.username,
        recipientDisplayName:
          recipient.displayName || recipient.username || "User",
        recipientAvatarUrl: recipient.avatarUrl,
        senderName: sender?.displayName || sender?.username || null,
        senderAvatarUrl: sender?.avatarUrl || null,
      }
    })
    .filter((qa) => qa !== null)

  return (
    <MainContent>
      <div className="mb-8 space-y-2">
        <h1 className="font-bold text-3xl text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      {questionsWithInfo.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-6 pb-24">
          {questionsWithInfo.map((qa) => (
            <AnsweredQuestionCard
              anonymousAvatarSeed={qa.question.anonymousAvatarSeed}
              answerContent={qa.answer.content}
              answerCreatedAt={qa.answer._creationTime}
              avatarUrl={qa.recipientAvatarUrl}
              displayName={qa.recipientDisplayName}
              isAnonymous={qa.question.isAnonymous}
              key={qa.question._id}
              labels={cardLabels}
              locale={locale}
              questionContent={qa.question.content}
              questionCreatedAt={qa.question._creationTime}
              questionId={qa.question._id}
              senderAvatarUrl={qa.senderAvatarUrl}
              senderName={qa.senderName || undefined}
              username={qa.recipientUsername}
            />
          ))}
        </div>
      )}
    </MainContent>
  )
}

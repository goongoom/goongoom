import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { MainContent } from "@/components/layout/main-content"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { ToastOnMount } from "@/components/ui/toast-on-mount"
import { getClerkUsersByIds } from "@/lib/clerk"
import { getOrCreateUser, getUnansweredQuestions } from "@/lib/db/queries"
import { InboxList } from "./inbox-list"

interface InboxPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect("/")
  }

  const [, unansweredQuestions, query, t, tCommon] = await Promise.all([
    getOrCreateUser(clerkId),
    getUnansweredQuestions(clerkId),
    searchParams,
    getTranslations("inbox"),
    getTranslations("common"),
  ])

  const error =
    typeof query?.error === "string" ? decodeURIComponent(query.error) : null

  const senderIds = Array.from(
    new Set(
      (unansweredQuestions ?? [])
        .filter((question) => question && !question.isAnonymous)
        .map((question) => question?.senderClerkId)
        .filter((id): id is string => Boolean(id))
    )
  )

  const senderMap = await getClerkUsersByIds(senderIds)

  const questionsWithSenders = (unansweredQuestions ?? [])
    .filter(
      (question): question is NonNullable<typeof question> => question !== null
    )
    .map((question) => {
      const sender =
        !question.isAnonymous && question.senderClerkId
          ? senderMap.get(question.senderClerkId) || null
          : null
      const isAnonymous = question.isAnonymous || !sender

      return {
        id: question._id,
        content: question.content,
        isAnonymous,
        createdAt: question._creationTime,
        senderName: isAnonymous
          ? tCommon("anonymous")
          : sender?.displayName || sender?.username || tCommon("user"),
        senderAvatarUrl: isAnonymous ? undefined : sender?.avatarUrl,
        anonymousAvatarSeed: isAnonymous
          ? question.anonymousAvatarSeed
          : undefined,
      }
    })

  return (
    <MainContent>
      <div className="mb-8 space-y-2">
        <h1 className="font-bold text-3xl text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      {error && <ToastOnMount message={error} type="error" />}

      {questionsWithSenders.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <InboxList questions={questionsWithSenders} />
      )}
    </MainContent>
  )
}

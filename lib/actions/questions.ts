"use server"

import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"
import { withAudit } from "@/lib/audit/with-audit"
import { getClerkUserById } from "@/lib/clerk"
import {
  createQuestion as createQuestionDB,
  getOrCreateUser,
} from "@/lib/db/queries"
import { sendPushToMany } from "@/lib/push"
import { DEFAULT_QUESTION_SECURITY_LEVEL } from "@/lib/question-security"
import type { Question } from "@/lib/types"
import { getPushSubscriptions } from "./push"

export type QuestionActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

function validateQuestionSecurity(
  securityLevel: string,
  isAnonymous: boolean,
  senderClerkId: string | null,
  t: Awaited<ReturnType<typeof getTranslations>>
): { success: false; error: string } | null {
  const isPublicQuestion = !isAnonymous
  const isLoggedIn = senderClerkId !== null
  const requiresPublicOnly = securityLevel === "public_only"
  const requiresVerifiedAnonymous = securityLevel === "verified_anonymous"

  if (isPublicQuestion && !isLoggedIn) {
    return { success: false, error: t("publicQuestionLoginRequired") }
  }

  if (requiresPublicOnly && isAnonymous) {
    return { success: false, error: t("publicQuestionOnly") }
  }

  if (requiresVerifiedAnonymous && isAnonymous && !isLoggedIn) {
    return { success: false, error: t("anonymousLoginRequired") }
  }

  return null
}

export async function createQuestion(data: {
  recipientClerkId: string
  content: string
  isAnonymous: boolean
}): Promise<QuestionActionResult<Question>> {
  return await withAudit(
    { action: "createQuestion", payload: data, entityType: "question" },
    async () => {
      const t = await getTranslations("errors")
      try {
        const { userId } = await auth()
        const senderClerkId = userId ?? null
        const { recipientClerkId, content, isAnonymous } = data

        if (!(recipientClerkId && content)) {
          return { success: false, error: t("recipientAndContentRequired") }
        }

        const recipientUser = await getClerkUserById(recipientClerkId)
        if (!recipientUser) {
          return { success: false, error: t("userDoesNotExist") }
        }

        const recipientDbUser = await getOrCreateUser(recipientClerkId)
        const securityLevel =
          recipientDbUser?.questionSecurityLevel ||
          DEFAULT_QUESTION_SECURITY_LEVEL

        const validationError = validateQuestionSecurity(
          securityLevel,
          isAnonymous,
          senderClerkId,
          t
        )
        if (validationError) {
          return validationError
        }

        const [question] = await createQuestionDB({
          recipientClerkId,
          senderClerkId,
          content,
          isAnonymous: isAnonymous ? 1 : 0,
        })

        if (!question) {
          return { success: false, error: t("questionCreateFailed") }
        }

        const subscriptions = await getPushSubscriptions(recipientClerkId)
        if (subscriptions.length > 0) {
          const truncatedContent =
            content.length > 50 ? `${content.slice(0, 50)}...` : content
          sendPushToMany(subscriptions, {
            title: "새로운 질문이 도착했어요!",
            body: truncatedContent,
            url: "/inbox",
            tag: `question-${question._id}`,
          })
        }

        return { success: true, data: question }
      } catch (error) {
        console.error("Question creation error:", error)
        return { success: false, error: t("questionCreateError") }
      }
    }
  )
}

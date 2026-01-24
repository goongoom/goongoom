"use server"

import { auth } from "@clerk/nextjs/server"
import { waitUntil } from "@vercel/functions"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { defaultLocale, type Locale, locales } from "@/i18n/config"
import { withAudit } from "@/lib/audit/with-audit"
import { invalidateOgImage, invalidateQuestions } from "@/lib/cache/invalidate"
import { getClerkUserById } from "@/lib/clerk"
import {
  createQuestion as createQuestionDB,
  getOrCreateUser,
  getQuestionById,
  getUserLocale,
  softDeleteQuestion,
} from "@/lib/db/queries"
import { sendPushToMany } from "@/lib/push"
import { DEFAULT_QUESTION_SECURITY_LEVEL } from "@/lib/question-security"
import type { Question, QuestionId } from "@/lib/types"
import { getPushSubscriptions } from "./push"

async function getMessagesForLocale(locale: Locale) {
  return (await import(`../../messages/${locale}.json`)).default
}

async function sendQuestionNotification(
  recipientClerkId: string,
  content: string,
  questionId: string
) {
  const subscriptions = await getPushSubscriptions(recipientClerkId)
  if (subscriptions.length === 0) {
    return
  }

  const recipientLocaleRaw = await getUserLocale(recipientClerkId)
  const recipientLocale: Locale =
    recipientLocaleRaw && locales.includes(recipientLocaleRaw as Locale)
      ? (recipientLocaleRaw as Locale)
      : defaultLocale
  const messages = await getMessagesForLocale(recipientLocale)
  const truncatedContent =
    content.length > 50 ? `${content.slice(0, 50)}...` : content
  sendPushToMany(subscriptions, {
    title: messages.push.newQuestionTitle,
    body: truncatedContent,
    url: "/inbox",
    tag: `question-${questionId}`,
  })
}

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
  anonymousAvatarSeed?: string
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
          anonymousAvatarSeed: isAnonymous
            ? data.anonymousAvatarSeed
            : undefined,
        })

        if (!question) {
          return { success: false, error: t("questionCreateFailed") }
        }

        waitUntil(
          sendQuestionNotification(
            recipientClerkId,
            content,
            question._id
          ).catch((err) => console.error("Push notification failed:", err))
        )

        return { success: true, data: question }
      } catch (error) {
        console.error("Question creation error:", error)
        return { success: false, error: t("questionCreateError") }
      }
    }
  )
}

export async function declineQuestion(data: {
  questionId: string
}): Promise<QuestionActionResult<{ id: string; questionId: string }>> {
  return await withAudit(
    {
      action: "declineQuestion",
      payload: data,
      entityType: "question",
    },
    async () => {
      const t = await getTranslations("errors")
      try {
        const { userId: clerkId } = await auth()
        if (!clerkId) {
          return { success: false, error: t("loginRequired") }
        }

        const { questionId: questionIdParam } = data
        if (!questionIdParam) {
          return { success: false, error: t("questionIdRequired") }
        }

        const questionId = questionIdParam as QuestionId
        const question = await getQuestionById(questionId)
        if (!question) {
          return { success: false, error: t("questionNotFound") }
        }
        if (question.recipientClerkId !== clerkId) {
          return { success: false, error: t("onlyRecipientCanDeleteQuestion") }
        }

        await softDeleteQuestion(questionId, clerkId)
        await Promise.all([
          invalidateQuestions(),
          invalidateOgImage(questionId),
        ])
        revalidatePath("/inbox")

        return { success: true, data: { id: questionId, questionId } }
      } catch (error) {
        console.error("Question decline error:", error)
        return { success: false, error: t("questionDeleteError") }
      }
    }
  )
}

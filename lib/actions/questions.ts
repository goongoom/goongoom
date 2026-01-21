"use server"

import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"
import { getClerkUserById } from "@/lib/clerk"
import {
  createQuestion as createQuestionDB,
  getOrCreateUser,
} from "@/lib/db/queries"
import { DEFAULT_QUESTION_SECURITY_LEVEL } from "@/lib/question-security"
import type { Question } from "@/lib/types"

export type QuestionActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createQuestion(data: {
  recipientClerkId: string
  content: string
  isAnonymous: boolean
}): Promise<QuestionActionResult<Question>> {
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
      recipientDbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL

    if (!(isAnonymous || senderClerkId)) {
      return {
        success: false,
        error: t("publicQuestionLoginRequired"),
      }
    }

    if (securityLevel === "public_only" && isAnonymous) {
      return {
        success: false,
        error: t("publicQuestionOnly"),
      }
    }

    if (
      securityLevel === "verified_anonymous" &&
      isAnonymous &&
      !senderClerkId
    ) {
      return {
        success: false,
        error: t("anonymousLoginRequired"),
      }
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

    return { success: true, data: question }
  } catch (error) {
    console.error("Question creation error:", error)
    return { success: false, error: t("questionCreateError") }
  }
}

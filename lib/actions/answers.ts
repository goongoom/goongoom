"use server"

import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"
import { withAudit } from "@/lib/audit/with-audit"
import {
  createAnswer as createAnswerDB,
  getQuestionById,
} from "@/lib/db/queries"
import type { Answer } from "@/lib/types"

export type AnswerActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createAnswer(data: {
  questionId: string
  content: string
}): Promise<AnswerActionResult<Answer>> {
  return await withAudit(
    { action: "createAnswer", payload: data, entityType: "answer" },
    async () => {
      const t = await getTranslations("errors")
      try {
        const { userId: clerkId } = await auth()

        if (!clerkId) {
          return { success: false, error: t("loginRequired") }
        }

        const { questionId, content } = data

        if (!(questionId && content)) {
          return { success: false, error: t("questionIdAndContentRequired") }
        }

        const question = await getQuestionById(questionId)
        if (!question) {
          return { success: false, error: t("questionNotFound") }
        }

        if (question.recipientClerkId !== clerkId) {
          return { success: false, error: t("onlyRecipientCanAnswer") }
        }

        const [answer] = await createAnswerDB({
          questionId,
          content,
        })

        if (!answer) {
          return { success: false, error: t("answerCreateFailed") }
        }

        return { success: true, data: answer }
      } catch (error) {
        console.error("Answer creation error:", error)
        return { success: false, error: t("answerCreateError") }
      }
    }
  )
}

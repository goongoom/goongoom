"use server"

import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"
import { withAudit } from "@/lib/audit/with-audit"
import { getClerkUserById } from "@/lib/clerk"
import {
  createAnswer as createAnswerDB,
  getQuestionById,
} from "@/lib/db/queries"
import { sendPushToMany } from "@/lib/push"
import type { Answer, Question, QuestionId } from "@/lib/types"
import { getPushSubscriptions } from "./push"

export type AnswerActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

async function notifyQuestionSender(
  question: Question,
  answer: Answer,
  answererClerkId: string
) {
  if (!question.senderClerkId) {
    return
  }

  const subscriptions = await getPushSubscriptions(question.senderClerkId)
  if (subscriptions.length === 0) {
    return
  }

  const recipientUser = await getClerkUserById(answererClerkId)
  const recipientName = recipientUser?.username ?? "누군가"
  const truncatedContent =
    answer.content.length > 50
      ? `${answer.content.slice(0, 50)}...`
      : answer.content

  sendPushToMany(subscriptions, {
    title: `${recipientName}님이 답변했어요!`,
    body: truncatedContent,
    url: "/sent",
    tag: `answer-${answer._id}`,
  })
}

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

        const { questionId: questionIdParam, content } = data

        if (!(questionIdParam && content)) {
          return { success: false, error: t("questionIdAndContentRequired") }
        }

        const questionId = questionIdParam as QuestionId
        const question = await getQuestionById(questionId)
        if (!question) {
          return { success: false, error: t("questionNotFound") }
        }

        if (question.recipientClerkId !== clerkId) {
          return { success: false, error: t("onlyRecipientCanAnswer") }
        }

        const [answer] = await createAnswerDB({ questionId, content })

        if (!answer) {
          return { success: false, error: t("answerCreateFailed") }
        }

        notifyQuestionSender(question, answer, clerkId)

        return { success: true, data: answer }
      } catch (error) {
        console.error("Answer creation error:", error)
        return { success: false, error: t("answerCreateError") }
      }
    }
  )
}

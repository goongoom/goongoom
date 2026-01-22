import { fetchMutation, fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { QuestionSecurityLevel } from "@/lib/question-security"

export interface SocialLinks {
  instagram?: string
  facebook?: string
  github?: string
  twitter?: string
}

export async function getOrCreateUser(clerkId: string) {
  return await fetchMutation(api.users.getOrCreate, { clerkId })
}

export async function updateUserProfile(
  clerkId: string,
  data: {
    bio?: string | null
    socialLinks?: SocialLinks | null
    questionSecurityLevel?: QuestionSecurityLevel | null
  }
) {
  const result = await fetchMutation(api.users.updateProfile, {
    clerkId,
    bio: data.bio,
    socialLinks: data.socialLinks ?? undefined,
    questionSecurityLevel: data.questionSecurityLevel ?? undefined,
  })
  return result ? [result] : []
}

export async function createQuestion(data: {
  recipientClerkId: string
  senderClerkId?: string | null
  content: string
  isAnonymous: number
}) {
  const result = await fetchMutation(api.questions.create, {
    recipientClerkId: data.recipientClerkId,
    senderClerkId: data.senderClerkId ?? undefined,
    content: data.content,
    isAnonymous: data.isAnonymous === 1,
  })
  return result ? [result] : []
}

export async function createAnswer(data: {
  questionId: string
  content: string
}) {
  const result = await fetchMutation(api.answers.create, {
    questionId: data.questionId as Id<"questions">,
    content: data.content,
  })
  return result ? [result] : []
}

export async function getQuestionById(id: string) {
  return await fetchQuery(api.questions.getById, {
    id: id as Id<"questions">,
  })
}

export async function getUserWithAnsweredQuestions(clerkId: string) {
  const [user, answeredQuestions] = await Promise.all([
    fetchQuery(api.users.getByClerkId, { clerkId }),
    fetchQuery(api.questions.getAnsweredByRecipient, {
      recipientClerkId: clerkId,
    }),
  ])

  return {
    user,
    answeredQuestions: answeredQuestions ?? [],
  }
}

export async function getUnansweredQuestions(clerkId: string) {
  return await fetchQuery(api.questions.getUnanswered, {
    recipientClerkId: clerkId,
  })
}

export async function getRecentAnsweredQuestions(limit = 20) {
  return await fetchQuery(api.answers.getRecent, { limit })
}

export async function getQuestionsWithAnswers(
  recipientClerkId: string,
  options?: { limit?: number; offset?: number }
) {
  return await fetchQuery(api.questions.getByRecipient, {
    recipientClerkId,
    limit: options?.limit,
  })
}

export async function getTotalUserCount(): Promise<number> {
  return await fetchQuery(api.users.count, {})
}

export async function getQuestionByIdAndRecipient(
  questionId: string,
  recipientClerkId: string
) {
  return await fetchQuery(api.questions.getByIdAndRecipient, {
    id: questionId as Id<"questions">,
    recipientClerkId,
  })
}

export async function getAnsweredQuestionNumber(
  questionId: string,
  recipientClerkId: string
): Promise<number> {
  return await fetchQuery(api.questions.getAnsweredNumber, {
    questionId: questionId as Id<"questions">,
    recipientClerkId,
  })
}

export async function getSentQuestionsWithAnswers(
  senderClerkId: string,
  options?: { limit?: number; offset?: number }
) {
  return await fetchQuery(api.questions.getSentByUser, {
    senderClerkId,
    limit: options?.limit,
  })
}

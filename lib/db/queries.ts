import { fetchMutation, fetchQuery } from "convex/nextjs"
import { unstable_cache } from "next/cache"
import { api } from "@/convex/_generated/api"
import type { QuestionId, SocialLinks } from "@/convex/types"
import { CACHE_TAGS } from "@/lib/cache/tags"
import type { QuestionSecurityLevel } from "@/lib/question-security"

export type { SocialLinks } from "@/convex/types"

export async function getOrCreateUser(clerkId: string) {
  return await fetchMutation(api.users.getOrCreate, { clerkId })
}

export async function updateUserProfile(
  clerkId: string,
  data: {
    bio?: string | null
    socialLinks?: SocialLinks | null
    questionSecurityLevel?: QuestionSecurityLevel | null
    signatureColor?: string | null
  }
) {
  const result = await fetchMutation(api.users.updateProfile, {
    clerkId,
    bio: data.bio,
    socialLinks: data.socialLinks ?? undefined,
    questionSecurityLevel: data.questionSecurityLevel ?? undefined,
    signatureColor: data.signatureColor ?? undefined,
  })
  return result ? [result] : []
}

export async function createQuestion(data: {
  recipientClerkId: string
  senderClerkId?: string | null
  content: string
  isAnonymous: number
  anonymousAvatarSeed?: string
}) {
  const result = await fetchMutation(api.questions.create, {
    recipientClerkId: data.recipientClerkId,
    senderClerkId: data.senderClerkId ?? undefined,
    content: data.content,
    isAnonymous: data.isAnonymous === 1,
    anonymousAvatarSeed: data.anonymousAvatarSeed,
  })
  return result ? [result] : []
}

export async function createAnswer(data: {
  questionId: QuestionId
  content: string
}) {
  const result = await fetchMutation(api.answers.create, {
    questionId: data.questionId,
    content: data.content,
  })
  return result ? [result] : []
}

export async function getQuestionById(id: QuestionId) {
  return await fetchQuery(api.questions.getById, { id })
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

export function getRecentAnswersLimitPerUser(
  totalLimit = 30,
  perUserLimit = 2
) {
  return unstable_cache(
    () =>
      fetchQuery(api.answers.getRecentLimitPerUser, {
        totalLimit,
        perUserLimit,
      }),
    [
      CACHE_TAGS.recentAnswers,
      `total:${totalLimit}`,
      `perUser:${perUserLimit}`,
    ],
    {
      revalidate: 30,
      tags: [CACHE_TAGS.answers, CACHE_TAGS.recentAnswers],
    }
  )()
}

export async function getQuestionByIdAndRecipient(
  questionId: QuestionId,
  recipientClerkId: string
) {
  return await fetchQuery(api.questions.getByIdAndRecipient, {
    id: questionId,
    recipientClerkId,
  })
}

export async function getAnsweredQuestionNumber(
  questionId: QuestionId,
  recipientClerkId: string
): Promise<number> {
  return await fetchQuery(api.questions.getAnsweredNumber, {
    questionId,
    recipientClerkId,
  })
}

export async function getUserLocale(clerkId: string) {
  const user = await fetchQuery(api.users.getByClerkId, { clerkId })
  return user?.locale
}

export async function getFriendsAnswers(clerkId: string, limit = 20) {
  return await fetchQuery(api.answers.getFriendsAnswers, { clerkId, limit })
}

export function getAnswerCount() {
  return unstable_cache(
    () => fetchQuery(api.answers.count, {}),
    [CACHE_TAGS.answerCount],
    {
      revalidate: 300,
      tags: [CACHE_TAGS.answers, CACHE_TAGS.answerCount],
    }
  )()
}

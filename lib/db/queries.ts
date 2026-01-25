import { auth } from '@clerk/nextjs/server'
import { fetchMutation, fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import type { QuestionId, SocialLinks } from '@/convex/types'
import type { QuestionSecurityLevel } from '@/lib/question-security'

export type { SocialLinks } from '@/convex/types'

async function getAuthToken() {
  return (await (await auth()).getToken({ template: 'convex' })) ?? undefined
}

export async function getOrCreateUser(clerkId: string) {
  const token = await getAuthToken()
  return await fetchMutation(api.users.getOrCreate, { clerkId }, { token })
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
  const token = await getAuthToken()
  const result = await fetchMutation(
    api.users.updateProfile,
    {
      clerkId,
      bio: data.bio,
      socialLinks: data.socialLinks ?? undefined,
      questionSecurityLevel: data.questionSecurityLevel ?? undefined,
      signatureColor: data.signatureColor ?? undefined,
    },
    { token }
  )
  return result ? [result] : []
}

export async function createQuestion(data: {
  recipientClerkId: string
  senderClerkId?: string | null
  content: string
  isAnonymous: number
  anonymousAvatarSeed?: string
}) {
  const token = await getAuthToken()
  const result = await fetchMutation(
    api.questions.create,
    {
      recipientClerkId: data.recipientClerkId,
      senderClerkId: data.senderClerkId ?? undefined,
      content: data.content,
      isAnonymous: data.isAnonymous === 1,
      anonymousAvatarSeed: data.anonymousAvatarSeed,
    },
    { token }
  )
  return result ? [result] : []
}

export async function createAnswer(data: { questionId: QuestionId; content: string }) {
  const token = await getAuthToken()
  const result = await fetchMutation(
    api.answers.create,
    {
      questionId: data.questionId,
      content: data.content,
    },
    { token }
  )
  return result ? [result] : []
}

export async function getQuestionById(id: QuestionId) {
  return await fetchQuery(api.questions.getById, { id })
}

export async function getUnansweredQuestions(clerkId: string) {
  return await fetchQuery(api.questions.getUnanswered, {
    recipientClerkId: clerkId,
  })
}

export async function getQuestionByIdAndRecipient(questionId: QuestionId, recipientClerkId: string) {
  return await fetchQuery(api.questions.getByIdAndRecipient, {
    id: questionId,
    recipientClerkId,
  })
}

import { db } from '@/src/db'
import { users, questions, answers } from '@/src/db/schema'
import type { SocialLinks } from '@/src/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function getOrCreateUser(clerkId: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  })
  
  if (existing) return existing
  
  const [newUser] = await db.insert(users).values({ clerkId }).returning()
  return newUser
}

export async function getUserByClerkId(clerkId: string) {
  return await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  })
}

export async function updateUserProfile(
  clerkId: string,
  data: {
    bio?: string | null
    socialLinks?: SocialLinks | null
  }
) {
  return await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.clerkId, clerkId))
    .returning()
}

export async function createQuestion(data: {
  recipientClerkId: string
  senderClerkId?: string | null
  content: string
  isAnonymous: number
}) {
  return await db.insert(questions).values(data).returning()
}

export async function getQuestionsByRecipient(recipientClerkId: string) {
  return await db.query.questions.findMany({
    where: eq(questions.recipientClerkId, recipientClerkId),
    orderBy: [desc(questions.createdAt)],
  })
}

export async function getUnansweredQuestions(recipientClerkId: string) {
  const allQuestions = await db.query.questions.findMany({
    where: eq(questions.recipientClerkId, recipientClerkId),
    orderBy: [desc(questions.createdAt)],
    with: {
      answers: true,
    },
  })
  
  return allQuestions.filter(q => q.answers.length === 0)
}

export async function getQuestionById(id: number) {
  return await db.query.questions.findFirst({
    where: eq(questions.id, id),
  })
}

export async function createAnswer(data: {
  questionId: number
  content: string
}) {
  return await db.insert(answers).values(data).returning()
}

export async function getAnswersForQuestion(questionId: number) {
  return await db.query.answers.findMany({
    where: eq(answers.questionId, questionId),
    orderBy: [desc(answers.createdAt)],
  })
}

export async function getAnsweredQuestionsForUser(recipientClerkId: string) {
  const allQuestions = await db.query.questions.findMany({
    where: eq(questions.recipientClerkId, recipientClerkId),
    orderBy: [desc(questions.createdAt)],
    with: {
      answers: true,
    },
  })
  
  return allQuestions.filter(q => q.answers.length > 0)
}

export async function getRecentAnsweredQuestions(limit = 20) {
  const recentAnswers = await db.query.answers.findMany({
    orderBy: [desc(answers.createdAt)],
    limit,
    with: {
      question: true,
    },
  })
  
  return recentAnswers.map(a => ({
    question: a.question,
    answer: a,
    recipientClerkId: a.question.recipientClerkId,
  }))
}

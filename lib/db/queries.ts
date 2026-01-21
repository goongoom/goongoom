import { count, desc, eq } from "drizzle-orm"
import type { QuestionSecurityLevel } from "@/lib/question-security"
import { db } from "@/src/db"
import type { SocialLinks } from "@/src/db/schema"
import { answers, questions, users } from "@/src/db/schema"

export async function getOrCreateUser(clerkId: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  })

  if (existing) {
    return existing
  }

  const [newUser] = await db.insert(users).values({ clerkId }).returning()
  return newUser
}

export async function updateUserProfile(
  clerkId: string,
  data: {
    bio?: string | null
    socialLinks?: SocialLinks | null
    questionSecurityLevel?: QuestionSecurityLevel | null
  }
) {
  const updateData: {
    bio?: string | null
    socialLinks?: SocialLinks | null
    questionSecurityLevel?: QuestionSecurityLevel
    updatedAt: Date
  } = {
    updatedAt: new Date(),
  }

  if ("bio" in data) {
    updateData.bio = data.bio
  }
  if ("socialLinks" in data) {
    updateData.socialLinks = data.socialLinks
  }
  if (data.questionSecurityLevel) {
    updateData.questionSecurityLevel = data.questionSecurityLevel
  }

  return await db
    .update(users)
    .set(updateData)
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

export async function createAnswer(data: {
  questionId: number
  content: string
}) {
  return await db.insert(answers).values(data).returning()
}

export async function getQuestionById(id: number) {
  return await db.query.questions.findFirst({
    where: eq(questions.id, id),
  })
}

export async function getUserWithAnsweredQuestions(clerkId: string) {
  const [user, allQuestions] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    }),
    db.query.questions.findMany({
      where: eq(questions.recipientClerkId, clerkId),
      orderBy: [desc(questions.createdAt)],
      with: {
        answers: true,
      },
    }),
  ])

  return {
    user,
    answeredQuestions: allQuestions.filter((q) => q.answers.length > 0),
  }
}

export async function getUnansweredQuestions(clerkId: string) {
  const allQuestions = await db.query.questions.findMany({
    where: eq(questions.recipientClerkId, clerkId),
    orderBy: [desc(questions.createdAt)],
    with: {
      answers: true,
    },
  })

  return allQuestions.filter((q) => q.answers.length === 0)
}

export async function getRecentAnsweredQuestions(limit = 20) {
  const recentAnswers = await db.query.answers.findMany({
    orderBy: [desc(answers.createdAt)],
    limit,
    with: {
      question: true,
    },
  })

  return recentAnswers.map((a) => ({
    question: a.question,
    answer: a,
    recipientClerkId: a.question.recipientClerkId,
  }))
}

export async function getQuestionsWithAnswers(
  recipientClerkId: string,
  options?: { limit?: number; offset?: number }
) {
  return await db.query.questions.findMany({
    where: eq(questions.recipientClerkId, recipientClerkId),
    orderBy: [desc(questions.createdAt)],
    with: {
      answers: true,
    },
    limit: options?.limit,
    offset: options?.offset,
  })
}

export async function getTotalUserCount(): Promise<number> {
  const result = await db.select({ count: count() }).from(users)
  return result[0]?.count ?? 0
}

export async function getQuestionByIdAndRecipient(
  questionId: number,
  recipientClerkId: string
) {
  return await db.query.questions.findFirst({
    where: (questions, { and, eq }) =>
      and(
        eq(questions.id, questionId),
        eq(questions.recipientClerkId, recipientClerkId)
      ),
    with: {
      answers: true,
    },
  })
}

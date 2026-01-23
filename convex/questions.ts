import { v } from "convex/values"
import type { Doc, Id } from "./_generated/dataModel"
import { mutation, type QueryCtx, query } from "./_generated/server"

/**
 * Fetches answers for a list of questions and returns a map for efficient lookup.
 * Filters out any null/undefined answer IDs and handles deleted answers gracefully.
 */
async function fetchAnswersMap(
  ctx: QueryCtx,
  questions: Array<{ answerId?: Id<"answers"> }>
): Promise<Map<Id<"answers">, Doc<"answers">>> {
  const answerIds = questions
    .map((q) => q.answerId)
    .filter((id): id is Id<"answers"> => id !== undefined)

  const answers = await Promise.all(answerIds.map((id) => ctx.db.get(id)))
  const validAnswers = answers.filter((a): a is Doc<"answers"> => a !== null)

  return new Map(validAnswers.map((a) => [a._id, a]))
}

export const create = mutation({
  args: {
    recipientClerkId: v.string(),
    senderClerkId: v.optional(v.string()),
    content: v.string(),
    isAnonymous: v.boolean(),
    anonymousAvatarSeed: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("questions", {
      recipientClerkId: args.recipientClerkId,
      senderClerkId: args.senderClerkId,
      content: args.content,
      isAnonymous: args.isAnonymous,
      anonymousAvatarSeed: args.anonymousAvatarSeed,
    })
    return await ctx.db.get(id)
  },
})

export const getById = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const getByIdAndRecipient = query({
  args: {
    id: v.id("questions"),
    recipientClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.id)
    if (!question || question.recipientClerkId !== args.recipientClerkId) {
      return null
    }

    const answer = question.answerId
      ? await ctx.db.get(question.answerId)
      : null

    return { ...question, answer }
  },
})

export const getByRecipient = query({
  args: {
    recipientClerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientClerkId", args.recipientClerkId)
      )
      .order("desc")
      .take(args.limit ?? 100)

    const answerMap = await fetchAnswersMap(ctx, questions)

    return questions.map((question) => ({
      ...question,
      answer: question.answerId
        ? (answerMap.get(question.answerId) ?? null)
        : null,
    }))
  },
})

export const getUnanswered = query({
  args: { recipientClerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientClerkId", args.recipientClerkId)
      )
      .filter((q) => q.eq(q.field("answerId"), undefined))
      .order("desc")
      .collect()
  },
})

export const getAnsweredByRecipient = query({
  args: { recipientClerkId: v.string() },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientClerkId", args.recipientClerkId)
      )
      .filter((q) => q.neq(q.field("answerId"), undefined))
      .order("desc")
      .collect()

    const answerMap = await fetchAnswersMap(ctx, questions)

    return questions.map((question) => ({
      ...question,
      answer: question.answerId
        ? (answerMap.get(question.answerId) ?? null)
        : null,
    }))
  },
})

export const getSentByUser = query({
  args: {
    senderClerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_sender", (q) => q.eq("senderClerkId", args.senderClerkId))
      .order("desc")
      .take(args.limit ?? 100)

    const answerMap = await fetchAnswersMap(ctx, questions)

    return questions.map((question) => ({
      ...question,
      answer: question.answerId
        ? (answerMap.get(question.answerId) ?? null)
        : null,
    }))
  },
})

export const getAnsweredNumber = query({
  args: {
    questionId: v.id("questions"),
    recipientClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId)
    if (!question) {
      return 0
    }

    // If the question itself isn't answered, return 0
    if (question.answerId === undefined) {
      return 0
    }

    // Collect answered questions in ascending order (oldest first)
    // and count only those up to and including our target question
    let count = 0
    const queryIter = ctx.db
      .query("questions")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientClerkId", args.recipientClerkId)
      )
      .order("asc")

    for await (const q of queryIter) {
      // Only count questions that have been answered
      if (q.answerId !== undefined) {
        count++
      }
      // Stop once we've counted our target question
      if (q._id === args.questionId) {
        break
      }
    }

    return count
  },
})

export const getFriends = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const friendsMap = new Map<
      string,
      {
        clerkId: string
        questionsReceived: number
        questionsSent: number
        lastInteractionTime: number
      }
    >()

    const receivedQuestions = await ctx.db
      .query("questions")
      .withIndex("by_recipient", (q) => q.eq("recipientClerkId", args.clerkId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isAnonymous"), false),
          q.neq(q.field("answerId"), undefined),
          q.neq(q.field("senderClerkId"), undefined)
        )
      )
      .collect()

    for (const question of receivedQuestions) {
      const senderId = question.senderClerkId
      if (!senderId || senderId === args.clerkId) {
        continue
      }

      const existing = friendsMap.get(senderId)
      if (existing) {
        existing.questionsReceived++
        existing.lastInteractionTime = Math.max(
          existing.lastInteractionTime,
          question._creationTime
        )
      } else {
        friendsMap.set(senderId, {
          clerkId: senderId,
          questionsReceived: 1,
          questionsSent: 0,
          lastInteractionTime: question._creationTime,
        })
      }
    }

    const sentQuestions = await ctx.db
      .query("questions")
      .withIndex("by_sender", (q) => q.eq("senderClerkId", args.clerkId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isAnonymous"), false),
          q.neq(q.field("answerId"), undefined)
        )
      )
      .collect()

    for (const question of sentQuestions) {
      const recipientId = question.recipientClerkId
      if (recipientId === args.clerkId) {
        continue
      }

      const existing = friendsMap.get(recipientId)
      if (existing) {
        existing.questionsSent++
        existing.lastInteractionTime = Math.max(
          existing.lastInteractionTime,
          question._creationTime
        )
      } else {
        friendsMap.set(recipientId, {
          clerkId: recipientId,
          questionsReceived: 0,
          questionsSent: 1,
          lastInteractionTime: question._creationTime,
        })
      }
    }

    return Array.from(friendsMap.values()).sort(
      (a, b) => b.lastInteractionTime - a.lastInteractionTime
    )
  },
})

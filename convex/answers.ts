import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    questionId: v.id("questions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId)
    if (!question || question.deletedAt) {
      throw new Error("Question not found")
    }
    if (question.answerId) {
      throw new Error("Question already answered")
    }

    const answerId = await ctx.db.insert("answers", {
      questionId: args.questionId,
      content: args.content,
    })

    await ctx.db.patch(args.questionId, { answerId })

    return await ctx.db.get(answerId)
  },
})

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const answers = await ctx.db
      .query("answers")
      .order("desc")
      .take(args.limit ?? 20)

    const questionIds = [...new Set(answers.map((a) => a.questionId))]
    const questions = await Promise.all(questionIds.map((id) => ctx.db.get(id)))
    const validQuestions = questions.filter(
      (q): q is NonNullable<typeof q> => q !== null
    )
    const questionMap = new Map(validQuestions.map((q) => [q._id, q]))

    return answers
      .map((answer) => {
        const question = questionMap.get(answer.questionId)
        if (!question) {
          return null
        }
        return {
          question,
          answer,
          recipientClerkId: question.recipientClerkId,
        }
      })
      .filter(Boolean)
  },
})

export const getFriendsAnswers = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const friendIds = new Set<string>()

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
      if (question.senderClerkId && question.senderClerkId !== args.clerkId) {
        friendIds.add(question.senderClerkId)
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
      if (question.recipientClerkId !== args.clerkId) {
        friendIds.add(question.recipientClerkId)
      }
    }

    if (friendIds.size === 0) {
      return []
    }

    const answers = await ctx.db
      .query("answers")
      .order("desc")
      .take((args.limit ?? 20) * 3)

    const questionIds = [...new Set(answers.map((a) => a.questionId))]
    const questions = await Promise.all(questionIds.map((id) => ctx.db.get(id)))
    const validQuestions = questions.filter(
      (q): q is NonNullable<typeof q> => q !== null
    )
    const questionMap = new Map(validQuestions.map((q) => [q._id, q]))

    const recipientClerkIds = [
      ...new Set(
        answers
          .map((a) => questionMap.get(a.questionId)?.recipientClerkId)
          .filter((id): id is string => id !== undefined && friendIds.has(id))
      ),
    ]
    const users = await Promise.all(
      recipientClerkIds.map((clerkId) =>
        ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
          .first()
      )
    )
    const userMap = new Map(
      users
        .filter((u): u is NonNullable<typeof u> => u !== null)
        .map((u) => [u.clerkId, u])
    )

    return answers
      .map((answer) => {
        const question = questionMap.get(answer.questionId)
        if (!question) {
          return null
        }
        if (!friendIds.has(question.recipientClerkId)) {
          return null
        }
        const user = userMap.get(question.recipientClerkId)
        return {
          question,
          answer,
          recipientClerkId: question.recipientClerkId,
          recipientSignatureColor: user?.signatureColor,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, args.limit ?? 20)
  },
})

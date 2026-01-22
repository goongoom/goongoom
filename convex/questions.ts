import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    recipientClerkId: v.string(),
    senderClerkId: v.optional(v.string()),
    content: v.string(),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("questions", {
      recipientClerkId: args.recipientClerkId,
      senderClerkId: args.senderClerkId,
      content: args.content,
      isAnonymous: args.isAnonymous,
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

    const answerIds = questions
      .map((q) => q.answerId)
      .filter((id): id is NonNullable<typeof id> => id !== undefined)
    const answers = await Promise.all(answerIds.map((id) => ctx.db.get(id)))
    const validAnswers = answers.filter(
      (a): a is NonNullable<typeof a> => a !== null
    )
    const answerMap = new Map(validAnswers.map((a) => [a._id, a]))

    return questions.map((question) => ({
      ...question,
      answer: question.answerId ? answerMap.get(question.answerId) : null,
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

    const answerIds = questions
      .map((q) => q.answerId)
      .filter((id): id is NonNullable<typeof id> => id !== undefined)
    const answers = await Promise.all(answerIds.map((id) => ctx.db.get(id)))
    const validAnswers = answers.filter(
      (a): a is NonNullable<typeof a> => a !== null
    )
    const answerMap = new Map(validAnswers.map((a) => [a._id, a]))

    return questions.map((question) => ({
      ...question,
      answer: question.answerId ? answerMap.get(question.answerId) : null,
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

    const answerIds = questions
      .map((q) => q.answerId)
      .filter((id): id is NonNullable<typeof id> => id !== undefined)
    const answers = await Promise.all(answerIds.map((id) => ctx.db.get(id)))
    const validAnswers = answers.filter(
      (a): a is NonNullable<typeof a> => a !== null
    )
    const answerMap = new Map(validAnswers.map((a) => [a._id, a]))

    return questions.map((question) => ({
      ...question,
      answer: question.answerId ? answerMap.get(question.answerId) : null,
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

    const answeredQuestions = await ctx.db
      .query("questions")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientClerkId", args.recipientClerkId)
      )
      .filter((q) => q.neq(q.field("answerId"), undefined))
      .collect()

    return answeredQuestions.filter(
      (q) => q._creationTime <= question._creationTime
    ).length
  },
})

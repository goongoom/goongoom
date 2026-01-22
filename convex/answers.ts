import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    questionId: v.id("questions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId)
    if (!question) {
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

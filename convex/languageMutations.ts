import { v } from 'convex/values'
import { internalMutation } from './_generated/server'

export const patchQuestionLanguage = internalMutation({
  args: {
    questionId: v.id('questions'),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.questionId, { language: args.language })
  },
})

export const patchAnswerLanguage = internalMutation({
  args: {
    answerId: v.id('answers'),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.answerId, { language: args.language })
  },
})

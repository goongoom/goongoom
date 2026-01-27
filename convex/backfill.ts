import { internal } from './_generated/api'
import { internalMutation } from './_generated/server'

export const backfillLanguages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query('questions').collect()
    let qScheduled = 0
    for (const q of questions) {
      if (!q.language && !q.deletedAt) {
        await ctx.scheduler.runAfter(0, internal.languageActions.detectQuestionLanguage, {
          questionId: q._id,
          content: q.content,
        })
        qScheduled++
      }
    }

    const answers = await ctx.db.query('answers').collect()
    let aScheduled = 0
    for (const a of answers) {
      if (!a.language && !a.deletedAt) {
        await ctx.scheduler.runAfter(0, internal.languageActions.detectAnswerLanguage, {
          answerId: a._id,
          content: a.content,
        })
        aScheduled++
      }
    }

    return { questionsScheduled: qScheduled, answersScheduled: aScheduled }
  },
})

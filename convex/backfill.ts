import { internalMutation } from './_generated/server'
import { detectLanguage } from './language'

export const backfillLanguages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query('questions').collect()
    let qPatched = 0
    for (const q of questions) {
      if (!q.language && !q.deletedAt) {
        await ctx.db.patch(q._id, { language: detectLanguage(q.content) })
        qPatched++
      }
    }

    const answers = await ctx.db.query('answers').collect()
    let aPatched = 0
    for (const a of answers) {
      if (!a.language && !a.deletedAt) {
        await ctx.db.patch(a._id, { language: detectLanguage(a.content) })
        aPatched++
      }
    }

    return { questionsPatched: qPatched, answersPatched: aPatched }
  },
})

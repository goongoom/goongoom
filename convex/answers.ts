import { ConvexError, v } from 'convex/values'
import { internal } from './_generated/api'
import { mutation, query } from './_generated/server'
import { CHAR_LIMITS } from './charLimits'

export const create = mutation({
  args: {
    questionId: v.id('questions'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.content.length > CHAR_LIMITS.ANSWER) {
      throw new ConvexError(`Answer exceeds ${CHAR_LIMITS.ANSWER} character limit`)
    }

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }

    const question = await ctx.db.get(args.questionId)
    if (!question || question.deletedAt) {
      throw new ConvexError('Question not found')
    }
    if (question.recipientClerkId !== identity.subject) {
      throw new ConvexError('Not authorized to answer this question')
    }
    if (question.answerId) {
      throw new ConvexError('Question already answered')
    }

    const answerId = await ctx.db.insert('answers', {
      questionId: args.questionId,
      content: args.content,
    })

    await ctx.db.patch(args.questionId, { answerId })

    if (question.senderClerkId) {
      const recipientUser = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', question.recipientClerkId))
        .first()

      const recipientName = recipientUser?.username ?? '누군가'
      const truncatedContent = args.content.length > 50 ? `${args.content.slice(0, 50)}...` : args.content

      await ctx.scheduler.runAfter(0, internal.pushActions.sendNotification, {
        recipientClerkId: question.senderClerkId,
        title: `${recipientName}님이 답변했어요!`,
        body: truncatedContent,
        url: '/sent',
        tag: `answer-${answerId}`,
      })
    }

    return await ctx.db.get(answerId)
  },
})

export const softDelete = mutation({
  args: {
    id: v.id('answers'),
    recipientClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.recipientClerkId) {
      throw new ConvexError('Not authorized')
    }

    const answer = await ctx.db.get(args.id)
    if (!answer) {
      throw new ConvexError('Answer not found')
    }
    if (answer.deletedAt) {
      return { success: true, questionId: answer.questionId }
    }

    const question = await ctx.db.get(answer.questionId)
    if (!question || question.recipientClerkId !== args.recipientClerkId) {
      throw new ConvexError('Not authorized to delete this answer')
    }

    await ctx.db.patch(args.id, { deletedAt: Date.now() })
    await ctx.db.patch(answer.questionId, { answerId: null })
    return { success: true, questionId: answer.questionId }
  },
})

export const restore = mutation({
  args: {
    id: v.id('answers'),
    recipientClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.recipientClerkId) {
      throw new ConvexError('Not authorized')
    }

    const answer = await ctx.db.get(args.id)
    if (!answer) {
      throw new ConvexError('Answer not found')
    }
    if (!answer.deletedAt) {
      return { success: true }
    }

    const question = await ctx.db.get(answer.questionId)
    if (!question || question.recipientClerkId !== args.recipientClerkId) {
      throw new ConvexError('Not authorized to restore this answer')
    }

    await ctx.db.patch(args.id, { deletedAt: undefined })
    await ctx.db.patch(answer.questionId, { answerId: args.id })
    return { success: true }
  },
})

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const answers = await ctx.db
      .query('answers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(args.limit ?? 20)

    const questionIds = [...new Set(answers.map((a) => a.questionId))]
    const questions = await Promise.all(questionIds.map((id) => ctx.db.get(id)))
    const validQuestions = questions.filter((q): q is NonNullable<typeof q> => q !== null && !q.deletedAt)
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

export const getRecentLimitPerUser = query({
  args: {
    totalLimit: v.optional(v.number()),
    perUserLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const totalLimit = args.totalLimit ?? 30
    const perUserLimit = args.perUserLimit ?? 2

    const answers = await ctx.db
      .query('answers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(totalLimit * 5)

    const questionIds = [...new Set(answers.map((a) => a.questionId))]
    const questions = await Promise.all(questionIds.map((id) => ctx.db.get(id)))
    const validQuestions = questions.filter((q): q is NonNullable<typeof q> => q !== null && !q.deletedAt)
    const questionMap = new Map(validQuestions.map((q) => [q._id, q]))

    const recipientClerkIds = [
      ...new Set(
        answers
          .map((a) => questionMap.get(a.questionId)?.recipientClerkId)
          .filter((id): id is string => id !== undefined)
      ),
    ]
    const users = await Promise.all(
      recipientClerkIds.map((clerkId) =>
        ctx.db
          .query('users')
          .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
          .first()
      )
    )
    const userMap = new Map(users.filter((u): u is NonNullable<typeof u> => u !== null).map((u) => [u.clerkId, u]))

    const enrichedAnswers = answers
      .map((answer) => {
        const question = questionMap.get(answer.questionId)
        if (!question) return null
        const user = userMap.get(question.recipientClerkId)
        return {
          question,
          answer,
          recipientClerkId: question.recipientClerkId,
          recipientUsername: user?.username,
          recipientFirstName: user?.firstName,
          recipientAvatarUrl: user?.avatarUrl,
          recipientSignatureColor: user?.signatureColor,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    const userAnswerCount = new Map<string, number>()
    const limitedResults: typeof enrichedAnswers = []

    for (const item of enrichedAnswers) {
      const count = userAnswerCount.get(item.recipientClerkId) ?? 0
      if (count < perUserLimit) {
        limitedResults.push(item)
        userAnswerCount.set(item.recipientClerkId, count + 1)
      }
      if (limitedResults.length >= totalLimit) break
    }

    return limitedResults
  },
})

export const count = query({
  args: {},
  handler: async (ctx) => {
    const answers = await ctx.db
      .query('answers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect()
    return answers.length
  },
})

export const getFriendsAnswers = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError('Not authorized to view this friends feed')
    }

    const friendIds = new Set<string>()

    const receivedQuestions = await ctx.db
      .query('questions')
      .withIndex('by_recipient', (q) => q.eq('recipientClerkId', args.clerkId))
      .filter((q) =>
        q.and(
          q.eq(q.field('isAnonymous'), false),
          q.neq(q.field('answerId'), undefined),
          q.neq(q.field('answerId'), null),
          q.neq(q.field('senderClerkId'), undefined),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .collect()

    for (const question of receivedQuestions) {
      if (question.senderClerkId && question.senderClerkId !== args.clerkId) {
        friendIds.add(question.senderClerkId)
      }
    }

    const sentQuestions = await ctx.db
      .query('questions')
      .withIndex('by_sender', (q) => q.eq('senderClerkId', args.clerkId))
      .filter((q) =>
        q.and(
          q.eq(q.field('isAnonymous'), false),
          q.neq(q.field('answerId'), undefined),
          q.neq(q.field('answerId'), null),
          q.eq(q.field('deletedAt'), undefined)
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
      .query('answers')
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take((args.limit ?? 20) * 3)

    const questionIds = [...new Set(answers.map((a) => a.questionId))]
    const questions = await Promise.all(questionIds.map((id) => ctx.db.get(id)))
    const validQuestions = questions.filter((q): q is NonNullable<typeof q> => q !== null && !q.deletedAt)
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
          .query('users')
          .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
          .first()
      )
    )
    const userMap = new Map(users.filter((u): u is NonNullable<typeof u> => u !== null).map((u) => [u.clerkId, u]))

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
          recipientUsername: user?.username,
          recipientFirstName: user?.firstName,
          recipientAvatarUrl: user?.avatarUrl,
          recipientSignatureColor: user?.signatureColor,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, args.limit ?? 20)
  },
})

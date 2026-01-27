import { ConvexError, v } from 'convex/values'
import { internal } from './_generated/api'
import { mutation, query } from './_generated/server'
import { CHAR_LIMITS } from './charLimits'

const ANSWER_PUSH_MESSAGES = {
  ko: {
    titleWithName: (name: string) => `${name}님이 답변했어요!`,
    fallbackName: '누군가',
  },
  en: {
    titleWithName: (name: string) => `${name} replied!`,
    fallbackName: 'Someone',
  },
  ja: {
    titleWithName: (name: string) => `${name}さんが回答しました！`,
    fallbackName: '誰か',
  },
} as const

type SupportedLocale = keyof typeof ANSWER_PUSH_MESSAGES

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

    // Schedule async AI-based language detection
    await ctx.scheduler.runAfter(0, internal.languageActions.detectAnswerLanguage, {
      answerId,
      content: args.content,
    })

    const patchPromise = ctx.db.patch(args.questionId, { answerId })

    if (question.senderClerkId) {
      const senderClerkId = question.senderClerkId

      const answerAuthorPromise = ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', question.recipientClerkId))
        .first()

      const senderUserPromise = ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', senderClerkId))
        .first()

      const [answerAuthor, senderUser] = await Promise.all([answerAuthorPromise, senderUserPromise, patchPromise])

      const senderLocale = (senderUser?.locale ?? 'ko') as SupportedLocale
      const messages = ANSWER_PUSH_MESSAGES[senderLocale] ?? ANSWER_PUSH_MESSAGES.ko
      const authorName = answerAuthor?.username ?? messages.fallbackName
      const authorUsername = answerAuthor?.username
      const truncatedContent = args.content.length > 50 ? `${args.content.slice(0, 50)}...` : args.content
      const notificationUrl = authorUsername ? `/${authorUsername}/q/${question._id}` : '/friends'

      await ctx.scheduler.runAfter(0, internal.pushActions.sendNotification, {
        recipientClerkId: senderClerkId,
        title: messages.titleWithName(authorName),
        body: truncatedContent,
        url: notificationUrl,
        tag: `answer-${answerId}`,
      })
    } else {
      await patchPromise
    }

    return ctx.db.get(answerId)
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

    const [receivedQuestions, sentQuestions] = await Promise.all([
      ctx.db
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
        .collect(),
      ctx.db
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
        .collect(),
    ])

    for (const question of receivedQuestions) {
      if (question.senderClerkId && question.senderClerkId !== args.clerkId) {
        friendIds.add(question.senderClerkId)
      }
    }

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
    const senderClerkIds = [
      ...new Set(
        answers
          .map((a) => {
            const question = questionMap.get(a.questionId)
            return question && !question.isAnonymous ? question.senderClerkId : undefined
          })
          .filter((id): id is string => id !== undefined)
      ),
    ]
    const allClerkIds = [...new Set([...recipientClerkIds, ...senderClerkIds])]
    const users = await Promise.all(
      allClerkIds.map((clerkId) =>
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
        const recipientUser = userMap.get(question.recipientClerkId)
        const senderUser = question.senderClerkId ? userMap.get(question.senderClerkId) : undefined
        return {
          question,
          answer,
          recipientClerkId: question.recipientClerkId,
          recipientUsername: recipientUser?.username,
          recipientFirstName: recipientUser?.firstName,
          recipientAvatarUrl: recipientUser?.avatarUrl,
          recipientSignatureColor: recipientUser?.signatureColor,
          senderFirstName: senderUser?.firstName,
          senderAvatarUrl: senderUser?.avatarUrl,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, args.limit ?? 20)
  },
})

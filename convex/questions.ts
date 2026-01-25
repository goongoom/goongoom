import { ConvexError, v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { internal } from './_generated/api'
import { mutation, type QueryCtx, query } from './_generated/server'
import { CHAR_LIMITS } from './charLimits'

const PUSH_MESSAGES = {
  ko: { newQuestionTitle: '새 질문이 왔어요!' },
  en: { newQuestionTitle: 'You got a new question!' },
} as const

/**
 * Fetches answers for a list of questions and returns a map for efficient lookup.
 * Filters out any null/undefined answer IDs and handles deleted answers gracefully.
 */
async function fetchAnswersMap(
  ctx: QueryCtx,
  questions: Array<{ answerId?: Id<'answers'> | null }>
): Promise<Map<Id<'answers'>, Doc<'answers'>>> {
  const answerIds = questions.map((q) => q.answerId).filter((id): id is Id<'answers'> => id != null)

  const answers = await Promise.all(answerIds.map((id) => ctx.db.get(id)))
  const validAnswers = answers.filter((a): a is Doc<'answers'> => a !== null && !a.deletedAt)

  return new Map(validAnswers.map((a) => [a._id, a]))
}

/**
 * Fetches users for a list of clerkIds and returns a map for efficient lookup.
 */
async function fetchUsersMap(ctx: QueryCtx, clerkIds: string[]): Promise<Map<string, Doc<'users'>>> {
  const uniqueIds = [...new Set(clerkIds.filter(Boolean))]
  const users = await Promise.all(
    uniqueIds.map((clerkId) =>
      ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
        .first()
    )
  )
  const validUsers = users.filter((u): u is Doc<'users'> => u !== null)
  return new Map(validUsers.map((u) => [u.clerkId, u]))
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
    if (args.content.length > CHAR_LIMITS.QUESTION) {
      throw new ConvexError(`Question exceeds ${CHAR_LIMITS.QUESTION} character limit`)
    }

    const identity = await ctx.auth.getUserIdentity()

    // Fetch recipient user to check security level
    const recipientUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.recipientClerkId))
      .first()

    if (!recipientUser) {
      throw new ConvexError('Recipient user not found')
    }

    const securityLevel = recipientUser.questionSecurityLevel ?? 'anyone'

    // Enforce security level
    if (securityLevel === 'nobody') {
      throw new ConvexError('This user is not accepting questions')
    }

    if (securityLevel === 'loggedIn' && !identity) {
      throw new ConvexError('You must be logged in to send questions to this user')
    }

    // If senderClerkId is provided, verify it matches the authenticated user
    if (args.senderClerkId) {
      if (!identity) {
        throw new ConvexError('Authentication required when providing senderClerkId')
      }
      // Clerk subject is the clerkId
      if (identity.subject !== args.senderClerkId) {
        throw new ConvexError('senderClerkId must match authenticated user')
      }
    }

    const id = await ctx.db.insert('questions', {
      recipientClerkId: args.recipientClerkId,
      senderClerkId: args.senderClerkId,
      content: args.content,
      isAnonymous: args.isAnonymous,
      anonymousAvatarSeed: args.anonymousAvatarSeed,
    })

    // Schedule push notification
    const recipientLocale = recipientUser.locale ?? 'ko'
    const messages = PUSH_MESSAGES[recipientLocale as keyof typeof PUSH_MESSAGES] ?? PUSH_MESSAGES.ko
    const truncatedContent = args.content.length > 50 ? `${args.content.slice(0, 50)}...` : args.content

    await ctx.scheduler.runAfter(0, internal.pushActions.sendNotification, {
      recipientClerkId: args.recipientClerkId,
      title: messages.newQuestionTitle,
      body: truncatedContent,
      url: '/inbox',
      tag: `question-${id}`,
    })

    return await ctx.db.get(id)
  },
})

export const softDelete = mutation({
  args: {
    id: v.id('questions'),
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

    const question = await ctx.db.get(args.id)
    if (!question) {
      throw new ConvexError('Question not found')
    }
    if (question.recipientClerkId !== args.recipientClerkId) {
      throw new ConvexError('Not authorized to delete this question')
    }
    if (question.deletedAt) {
      return { success: true }
    }
    await ctx.db.patch(args.id, { deletedAt: Date.now() })
    return { success: true }
  },
})

export const restore = mutation({
  args: {
    id: v.id('questions'),
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

    const question = await ctx.db.get(args.id)
    if (!question) {
      throw new ConvexError('Question not found')
    }
    if (question.recipientClerkId !== args.recipientClerkId) {
      throw new ConvexError('Not authorized to restore this question')
    }
    if (!question.deletedAt) {
      return { success: true }
    }

    await ctx.db.patch(args.id, { deletedAt: undefined })
    return { success: true }
  },
})

export const clearAnswerId = mutation({
  args: {
    id: v.id('questions'),
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

    const question = await ctx.db.get(args.id)
    if (!question) {
      throw new ConvexError('Question not found')
    }
    if (question.recipientClerkId !== args.recipientClerkId) {
      throw new ConvexError('Not authorized to update this question')
    }
    if (question.deletedAt) {
      throw new ConvexError('Question deleted')
    }
    await ctx.db.patch(args.id, { answerId: null })
    return { success: true }
  },
})

export const getById = query({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.id)
    if (!question || question.deletedAt) {
      return null
    }
    return question
  },
})

export const getByIdAndRecipient = query({
  args: {
    id: v.id('questions'),
    recipientClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.id)
    if (!question || question.deletedAt || question.recipientClerkId !== args.recipientClerkId) {
      return null
    }

    const answer = question.answerId ? await ctx.db.get(question.answerId) : null

    const sender = question.senderClerkId
      ? await ctx.db
          .query('users')
          .withIndex('by_clerk_id', (q) => q.eq('clerkId', question.senderClerkId!))
          .first()
      : null

    return {
      ...question,
      answer: answer && !answer.deletedAt ? answer : null,
      senderUsername: sender?.username,
      senderFirstName: sender?.firstName,
      senderAvatarUrl: sender?.avatarUrl,
    }
  },
})

export const getByRecipient = query({
  args: {
    recipientClerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query('questions')
      .withIndex('by_recipient', (q) => q.eq('recipientClerkId', args.recipientClerkId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(args.limit ?? 100)

    const answerMap = await fetchAnswersMap(ctx, questions)

    return questions.map((question) => ({
      ...question,
      answer: question.answerId ? (answerMap.get(question.answerId) ?? null) : null,
    }))
  },
})

export const getUnanswered = query({
  args: { recipientClerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.recipientClerkId) {
      throw new ConvexError('Not authorized to view this inbox')
    }

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_recipient', (q) => q.eq('recipientClerkId', args.recipientClerkId))
      .filter((q) =>
        q.and(
          q.or(q.eq(q.field('answerId'), undefined), q.eq(q.field('answerId'), null)),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .order('desc')
      .collect()

    const senderClerkIds = questions.map((q) => q.senderClerkId).filter((id): id is string => id !== undefined)
    const userMap = await fetchUsersMap(ctx, senderClerkIds)

    return questions.map((question) => {
      const sender = question.senderClerkId ? userMap.get(question.senderClerkId) : undefined
      return {
        ...question,
        senderUsername: sender?.username,
        senderFirstName: sender?.firstName,
        senderAvatarUrl: sender?.avatarUrl,
      }
    })
  },
})

export const getAnsweredByRecipient = query({
  args: { recipientClerkId: v.string() },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query('questions')
      .withIndex('by_recipient', (q) => q.eq('recipientClerkId', args.recipientClerkId))
      .filter((q) =>
        q.and(
          q.neq(q.field('answerId'), undefined),
          q.neq(q.field('answerId'), null),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .collect()

    const answerMap = await fetchAnswersMap(ctx, questions)

    const senderClerkIds = questions.map((q) => q.senderClerkId).filter((id): id is string => id !== undefined)
    const userMap = await fetchUsersMap(ctx, senderClerkIds)

    const questionsWithAnswers = questions.map((question) => {
      const sender = question.senderClerkId ? userMap.get(question.senderClerkId) : undefined
      return {
        ...question,
        answer: question.answerId ? (answerMap.get(question.answerId) ?? null) : null,
        senderUsername: sender?.username,
        senderFirstName: sender?.firstName,
        senderAvatarUrl: sender?.avatarUrl,
      }
    })

    return questionsWithAnswers.sort((a, b) => {
      const aTime = a.answer?._creationTime ?? 0
      const bTime = b.answer?._creationTime ?? 0
      return bTime - aTime
    })
  },
})

export const getSentByUser = query({
  args: {
    senderClerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query('questions')
      .withIndex('by_sender', (q) => q.eq('senderClerkId', args.senderClerkId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(args.limit ?? 100)

    const answerMap = await fetchAnswersMap(ctx, questions)

    return questions.map((question) => ({
      ...question,
      answer: question.answerId ? (answerMap.get(question.answerId) ?? null) : null,
    }))
  },
})

export const getAnsweredNumber = query({
  args: {
    questionId: v.id('questions'),
    recipientClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId)
    if (!question || question.deletedAt) {
      return 0
    }

    // If the question itself isn't answered, return 0
    if (question.answerId == null) {
      return 0
    }

    // Collect answered questions in ascending order (oldest first)
    // and count only those up to and including our target question
    let count = 0
    const queryIter = ctx.db
      .query('questions')
      .withIndex('by_recipient', (q) => q.eq('recipientClerkId', args.recipientClerkId))
      .order('asc')

    for await (const q of queryIter) {
      if (q.deletedAt) {
        continue
      }
      // Only count questions that have been answered
      if (q.answerId != null) {
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
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError('Not authorized to view this friends list')
    }

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
      const senderId = question.senderClerkId
      if (!senderId || senderId === args.clerkId) {
        continue
      }

      const existing = friendsMap.get(senderId)
      if (existing) {
        existing.questionsReceived++
        existing.lastInteractionTime = Math.max(existing.lastInteractionTime, question._creationTime)
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
      const recipientId = question.recipientClerkId
      if (recipientId === args.clerkId) {
        continue
      }

      const existing = friendsMap.get(recipientId)
      if (existing) {
        existing.questionsSent++
        existing.lastInteractionTime = Math.max(existing.lastInteractionTime, question._creationTime)
      } else {
        friendsMap.set(recipientId, {
          clerkId: recipientId,
          questionsReceived: 0,
          questionsSent: 1,
          lastInteractionTime: question._creationTime,
        })
      }
    }

    return Array.from(friendsMap.values()).sort((a, b) => b.lastInteractionTime - a.lastInteractionTime)
  },
})

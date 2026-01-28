import { ConvexError, v } from 'convex/values'
import { internal } from './_generated/api'
import { action, internalMutation, internalQuery, mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { CHAR_LIMITS } from './charLimits'

const HTML_TITLE_REGEX = /<title[^>]*>([^<]+)<\/title>/i
const NAVER_BLOG_TITLE_SUFFIX = ': 네이버 블로그'
const CJK_REGEX = /^[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u1100-\u11FF]+$/

function isAllCJK(str: string | null | undefined): boolean {
  if (!str) return false
  return CJK_REGEX.test(str)
}

function buildFullName(firstName: string | null | undefined, lastName: string | null | undefined): string | undefined {
  if (!firstName && !lastName) return undefined
  if (!firstName) return lastName || undefined
  if (!lastName) return firstName

  if (isAllCJK(firstName) && isAllCJK(lastName)) {
    return lastName + firstName
  }
  return firstName + ' ' + lastName
}

export const fetchNaverBlogTitle = action({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }

    if (!args.handle) {
      return args.handle
    }
    try {
      const url = `https://blog.naver.com/${args.handle}`
      const response = await fetch(url)
      if (!response.ok) {
        return args.handle
      }
      const html = await response.text()
      const titleMatch = HTML_TITLE_REGEX.exec(html)
      if (!titleMatch?.[1]) {
        return args.handle
      }
      let title = titleMatch[1]
      if (title.endsWith(NAVER_BLOG_TITLE_SUFFIX)) {
        title = title.slice(0, -NAVER_BLOG_TITLE_SUFFIX.length)
      }
      return title.trim() || args.handle
    } catch {
      return args.handle
    }
  },
})

// NOTE: Convex doesn't provide a native count() operation, so this implementation
// fetches all user documents to count them. This is the recommended Convex pattern
// for counting. For production scale with very large user counts (100k+), consider:
// 1. Maintaining a separate counter document that increments/decrements on user create/delete
// 2. Caching this value with a reasonable TTL if exact real-time accuracy isn't critical
export const count = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    return users.length
  },
})

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()
  },
})

export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    bio: v.optional(v.union(v.string(), v.null())),
    socialLinks: v.optional(
      v.union(
        v.array(
          v.object({
            platform: v.union(
              v.literal('instagram'),
              v.literal('twitter'),
              v.literal('youtube'),
              v.literal('github'),
              v.literal('naverBlog'),
              v.literal('threads')
            ),
            content: v.union(
              v.string(),
              v.object({
                handle: v.string(),
                label: v.string(),
              })
            ),
            labelType: v.union(v.literal('handle'), v.literal('custom')),
          })
        ),
        v.null()
      )
    ),
    questionSecurityLevel: v.optional(v.string()),
    signatureColor: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    if (args.bio && args.bio.length > CHAR_LIMITS.BIO) {
      throw new ConvexError(`Bio exceeds ${CHAR_LIMITS.BIO} character limit`)
    }

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError('Not authorized')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) {
      throw new ConvexError('User not found')
    }

    const updateData: {
      bio?: string
      socialLinks?: {
        platform: 'instagram' | 'twitter' | 'youtube' | 'github' | 'naverBlog' | 'threads'
        content: string | { handle: string; label: string }
        labelType: 'handle' | 'custom'
      }[]

      questionSecurityLevel?: string
      signatureColor?: string
      updatedAt: number
    } = {
      updatedAt: Date.now(),
    }

    if (args.bio !== undefined) {
      updateData.bio = args.bio ?? undefined
    }
    if (args.socialLinks !== undefined) {
      updateData.socialLinks = args.socialLinks ?? undefined
    }
    if (args.questionSecurityLevel) {
      updateData.questionSecurityLevel = args.questionSecurityLevel
    }
    if (args.signatureColor !== undefined) {
      updateData.signatureColor = args.signatureColor ?? undefined
    }

    await ctx.db.patch(user._id, updateData)
    return await ctx.db.get(user._id)
  },
})

export const deleteByClerkId = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError('Not authorized')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (user) {
      const username = user.username
      await ctx.db.delete(user._id)

      await ctx.scheduler.runAfter(0, internal.slackActions.notifyUserDeleted, {
        username,
        clerkId: args.clerkId,
        source: 'self' as const,
      })
    }
  },
})

export const updateLocale = mutation({
  args: {
    clerkId: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError('Not authorized')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (!user) {
      return await ctx.db.insert('users', {
        clerkId: args.clerkId,
        questionSecurityLevel: 'anyone',
        locale: args.locale,
        updatedAt: Date.now(),
      })
    }

    await ctx.db.patch(user._id, {
      locale: args.locale,
      updatedAt: Date.now(),
    })
    return user._id
  },
})

export const upsertFromWebhook = internalMutation({
  args: {
    clerkId: v.string(),
    username: v.optional(v.string()),
    firstName: v.optional(v.string()),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    referrerUsername: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    utmTerm: v.optional(v.string()),
    utmContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (existing) {
      const updates: {
        username?: string
        firstName?: string
        fullName?: string
        avatarUrl?: string
        updatedAt: number
      } = { updatedAt: Date.now() }

      if (args.username !== undefined) updates.username = args.username
      if (args.firstName !== undefined) updates.firstName = args.firstName
      if (args.fullName !== undefined) updates.fullName = args.fullName
      if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl

      await ctx.db.patch(existing._id, updates)
      return existing._id
    }

    // Look up referrer if provided
    let referredByUserId: Id<'users'> | undefined
    if (args.referrerUsername) {
      const referrer = await ctx.db
        .query('users')
        .withIndex('by_username', (q) => q.eq('username', args.referrerUsername))
        .unique()
      referredByUserId = referrer?._id
    }

    return await ctx.db.insert('users', {
      clerkId: args.clerkId,
      username: args.username,
      firstName: args.firstName,
      fullName: args.fullName,
      avatarUrl: args.avatarUrl,
      referredByUserId,
      questionSecurityLevel: 'anyone',
      updatedAt: Date.now(),
    })
  },
})

export const deleteFromWebhook = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (user) {
      await ctx.db.delete(user._id)
    }
  },
})

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()
  },
})

export const listAllInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  },
})

export const listAllUsernames = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    return users.map((u) => u.username).filter((username): username is string => username != null)
  },
})

export const syncFromClerk = action({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    totalUsers: number
    syncedCount: number
    errorCount: number
    errors: { clerkId: string; error: string }[]
  }> => {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY
    if (!clerkSecretKey) {
      throw new ConvexError('CLERK_SECRET_KEY not configured')
    }

    const users = await ctx.runQuery(internal.users.listAllInternal, {})
    let syncedCount = 0
    let errorCount = 0
    const errors: { clerkId: string; error: string }[] = []

    for (const user of users) {
      try {
        const response = await fetch(`https://api.clerk.com/v1/users/${user.clerkId}`, {
          headers: {
            Authorization: `Bearer ${clerkSecretKey}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            errors.push({ clerkId: user.clerkId, error: 'User not found in Clerk' })
          } else {
            errors.push({ clerkId: user.clerkId, error: `Clerk API error: ${response.status}` })
          }
          errorCount++
          continue
        }

        const clerkUser = (await response.json()) as {
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          image_url?: string | null
        }

        const firstName = clerkUser.first_name ?? undefined
        const fullName = buildFullName(clerkUser.first_name, clerkUser.last_name)

        await ctx.runMutation(internal.users.upsertFromWebhook, {
          clerkId: user.clerkId,
          username: clerkUser.username ?? undefined,
          firstName,
          fullName,
          avatarUrl: clerkUser.image_url ?? undefined,
        })

        syncedCount++
      } catch (err) {
        errors.push({ clerkId: user.clerkId, error: String(err) })
        errorCount++
      }
    }

    return {
      totalUsers: users.length,
      syncedCount,
      errorCount,
      errors: errors.slice(0, 10),
    }
  },
})

/**
 * Backfill firstName/fullName from Clerk API for all users.
 * Run via: npx convex run users:runMigrations
 */
export const runMigrations = action({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    totalUsers: number
    syncedCount: number
    errorCount: number
    errors: { clerkId: string; error: string }[]
  }> => {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY
    if (!clerkSecretKey) {
      throw new ConvexError('CLERK_SECRET_KEY not configured')
    }

    const users = await ctx.runQuery(internal.users.listAllInternal, {})
    let syncedCount = 0
    let errorCount = 0
    const errors: { clerkId: string; error: string }[] = []

    for (const user of users) {
      try {
        const response = await fetch(`https://api.clerk.com/v1/users/${user.clerkId}`, {
          headers: {
            Authorization: `Bearer ${clerkSecretKey}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            errors.push({ clerkId: user.clerkId, error: 'User not found in Clerk' })
          } else {
            errors.push({ clerkId: user.clerkId, error: `Clerk API error: ${response.status}` })
          }
          errorCount++
          continue
        }

        const clerkUser = (await response.json()) as {
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          image_url?: string | null
        }

        const firstName = clerkUser.first_name ?? undefined
        const fullName = buildFullName(clerkUser.first_name, clerkUser.last_name)

        await ctx.runMutation(internal.users.upsertFromWebhook, {
          clerkId: user.clerkId,
          username: clerkUser.username ?? undefined,
          firstName,
          fullName,
          avatarUrl: clerkUser.image_url ?? undefined,
        })

        syncedCount++
      } catch (err) {
        errors.push({ clerkId: user.clerkId, error: String(err) })
        errorCount++
      }
    }

    return {
      totalUsers: users.length,
      syncedCount,
      errorCount,
      errors: errors.slice(0, 10),
    }
  },
})

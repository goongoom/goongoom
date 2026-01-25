import { ConvexError, v } from 'convex/values'
import { action, internalMutation, mutation, query } from './_generated/server'

const HTML_TITLE_REGEX = /<title[^>]*>([^<]+)<\/title>/i
const NAVER_BLOG_TITLE_SUFFIX = ': 네이버 블로그'

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

export const getOrCreate = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError('Not authorized')
    }

    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (existing) {
      return existing
    }

    const id = await ctx.db.insert('users', {
      clerkId: args.clerkId,
      questionSecurityLevel: 'anyone',
      updatedAt: Date.now(),
    })

    return await ctx.db.get(id)
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
              v.literal('naverBlog')
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
    signatureColor: v.optional(v.string()),
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
      throw new ConvexError('User not found')
    }

    const updateData: {
      bio?: string
      socialLinks?: {
        platform: 'instagram' | 'twitter' | 'youtube' | 'github' | 'naverBlog'
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
      updateData.signatureColor = args.signatureColor
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
      await ctx.db.delete(user._id)
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
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (existing) {
      const updates: {
        username?: string
        displayName?: string
        avatarUrl?: string
        updatedAt: number
      } = { updatedAt: Date.now() }

      // Only update fields that have defined values to avoid clearing existing data
      if (args.username !== undefined) updates.username = args.username
      if (args.displayName !== undefined) updates.displayName = args.displayName
      if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl

      await ctx.db.patch(existing._id, updates)
      return existing._id
    }

    return await ctx.db.insert('users', {
      clerkId: args.clerkId,
      username: args.username,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
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

// One-time migration: Convert old socialLinks object format to new array format
// Old format: { instagram: "handle", twitter: "handle" }
// New format: [{ platform: "instagram", content: "handle", labelType: "handle" }, ...]
export const migrateSocialLinks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    let migratedCount = 0

    for (const user of users) {
      const socialLinks = user.socialLinks as unknown

      // Skip if already in new format (array) or undefined
      if (!socialLinks || Array.isArray(socialLinks)) {
        continue
      }

      // Convert old object format to new array format
      if (typeof socialLinks === 'object') {
        const oldFormat = socialLinks as Record<string, string>
        const platforms = ['instagram', 'twitter', 'youtube', 'github', 'naverBlog'] as const

        const newFormat: {
          platform: (typeof platforms)[number]
          content: string
          labelType: 'handle'
        }[] = []

        for (const platform of platforms) {
          if (oldFormat[platform]) {
            newFormat.push({
              platform,
              content: oldFormat[platform],
              labelType: 'handle',
            })
          }
        }

        await ctx.db.patch(user._id, {
          socialLinks: newFormat,
          updatedAt: Date.now(),
        })
        migratedCount++
      }
    }

    return { migratedCount, totalUsers: users.length }
  },
})

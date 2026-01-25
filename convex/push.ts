import { ConvexError, v } from 'convex/values'
import { internalQuery, mutation, query } from './_generated/server'

export const upsert = mutation({
  args: {
    clerkId: v.string(),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError('Not authorized')
    }

    const existing = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_endpoint', (q) => q.eq('endpoint', args.endpoint))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        clerkId: args.clerkId,
        p256dh: args.p256dh,
        auth: args.auth,
      })
      return existing._id
    }

    return await ctx.db.insert('pushSubscriptions', args)
  },
})

export const remove = mutation({
  args: {
    clerkId: v.string(),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError('Not authorized')
    }

    const subscription = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_endpoint', (q) => q.eq('endpoint', args.endpoint))
      .first()

    if (subscription && subscription.clerkId === args.clerkId) {
      await ctx.db.delete(subscription._id)
    }
  },
})

export const removeAll = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError('Not authorized')
    }

    const subscriptions = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .collect()

    await Promise.all(subscriptions.map((sub) => ctx.db.delete(sub._id)))
  },
})

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('Authentication required')
    }
    if (identity.subject !== args.clerkId) {
      throw new ConvexError('Not authorized')
    }

    return await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .collect()
  },
})

export const getByClerkIdInternal = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .collect()
  },
})

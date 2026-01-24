import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const upsert = mutation({
  args: {
    clerkId: v.string(),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  },
  handler: async (ctx, args) => {
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
    const subscription = await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_endpoint', (q) => q.eq('endpoint', args.endpoint))
      .first()

    if (subscription && subscription.clerkId === args.clerkId) {
      await ctx.db.delete(subscription._id)
    }
  },
})

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('pushSubscriptions')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .collect()
  },
})

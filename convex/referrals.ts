import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'

export const recordReferral = internalMutation({
  args: {
    referrerUsername: v.string(),
    referredUserId: v.id('users'),
    referredClerkId: v.string(),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    utmTerm: v.optional(v.string()),
    utmContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Look up referrer by username
    const referrer = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.referrerUsername))
      .unique()

    if (!referrer) {
      console.warn(`Referrer not found: ${args.referrerUsername}`)
      return
    }

    // Insert referral record
    await ctx.db.insert('referrals', {
      referrerUserId: referrer._id,
      referrerUsername: args.referrerUsername,
      referredUserId: args.referredUserId,
      referredClerkId: args.referredClerkId,
      utmSource: args.utmSource,
      utmMedium: args.utmMedium,
      utmCampaign: args.utmCampaign,
      utmTerm: args.utmTerm,
      utmContent: args.utmContent,
      referralSource: 'profile_visit',
      createdAt: Date.now(),
    })
  },
})

export const getReferralsByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('referrals')
      .withIndex('by_referrer', (q) => q.eq('referrerUserId', args.userId))
      .collect()
  },
})

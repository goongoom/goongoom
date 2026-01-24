import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const create = mutation({
  args: {
    ipAddress: v.optional(v.string()),
    geoCity: v.optional(v.string()),
    geoCountry: v.optional(v.string()),
    geoCountryFlag: v.optional(v.string()),
    geoRegion: v.optional(v.string()),
    geoEdgeRegion: v.optional(v.string()),
    geoLatitude: v.optional(v.string()),
    geoLongitude: v.optional(v.string()),
    geoPostalCode: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referer: v.optional(v.string()),
    acceptLanguage: v.optional(v.string()),
    userId: v.optional(v.string()),
    action: v.string(),
    payload: v.optional(v.any()),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('logs', args)
  },
})

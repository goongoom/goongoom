import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()
  },
})

export const getOrCreate = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (existing) {
      return existing
    }

    const id = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      questionSecurityLevel: "anyone",
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
        v.object({
          instagram: v.optional(v.string()),
          facebook: v.optional(v.string()),
          github: v.optional(v.string()),
          twitter: v.optional(v.string()),
        }),
        v.null()
      )
    ),
    questionSecurityLevel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const updateData: {
      bio?: string
      socialLinks?: {
        instagram?: string
        facebook?: string
        github?: string
        twitter?: string
      }
      questionSecurityLevel?: string
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

    await ctx.db.patch(user._id, updateData)
    return await ctx.db.get(user._id)
  },
})

export const deleteByClerkId = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (user) {
      await ctx.db.delete(user._id)
    }
  },
})

import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    bio: v.optional(v.string()),
    socialLinks: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        facebook: v.optional(v.string()),
        github: v.optional(v.string()),
        twitter: v.optional(v.string()),
      })
    ),
    questionSecurityLevel: v.string(),
    locale: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  questions: defineTable({
    recipientClerkId: v.string(),
    senderClerkId: v.optional(v.string()),
    content: v.string(),
    isAnonymous: v.boolean(),
    answerId: v.optional(v.id("answers")),
  })
    .index("by_recipient", ["recipientClerkId"])
    .index("by_sender", ["senderClerkId"])
    .index("by_recipient_unanswered", ["recipientClerkId", "answerId"]),

  answers: defineTable({
    questionId: v.id("questions"),
    content: v.string(),
  }).index("by_question", ["questionId"]),

  pushSubscriptions: defineTable({
    clerkId: v.string(),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_endpoint", ["endpoint"]),

  logs: defineTable({
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
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_entity", ["entityType", "entityId"]),
})

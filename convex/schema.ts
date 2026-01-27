import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.optional(v.string()),
    firstName: v.optional(v.string()),
    fullName: v.optional(v.string()),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    socialLinks: v.optional(
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
      )
    ),
    questionSecurityLevel: v.string(),
    locale: v.optional(v.string()),
    signatureColor: v.optional(v.string()),
    referredByUserId: v.optional(v.id('users')),
    updatedAt: v.number(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_username', ['username'])
    .index('by_referred_by', ['referredByUserId']),

  questions: defineTable({
    recipientClerkId: v.string(),
    senderClerkId: v.optional(v.string()),
    content: v.string(),
    isAnonymous: v.boolean(),
    anonymousAvatarSeed: v.optional(v.string()),
    answerId: v.optional(v.union(v.id('answers'), v.null())),
    language: v.optional(v.string()),
    deletedAt: v.optional(v.number()),
  })
    .index('by_recipient', ['recipientClerkId'])
    .index('by_sender', ['senderClerkId'])
    .index('by_recipient_unanswered', ['recipientClerkId', 'answerId']),

  answers: defineTable({
    questionId: v.id('questions'),
    content: v.string(),
    language: v.optional(v.string()),
    deletedAt: v.optional(v.number()),
  }).index('by_question', ['questionId']),

  pushSubscriptions: defineTable({
    clerkId: v.string(),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_endpoint', ['endpoint']),

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
    .index('by_user', ['userId'])
    .index('by_action', ['action'])
    .index('by_entity', ['entityType', 'entityId']),

  referrals: defineTable({
    referrerUserId: v.id('users'),
    referrerUsername: v.string(),
    referredUserId: v.id('users'),
    referredClerkId: v.string(),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    utmTerm: v.optional(v.string()),
    utmContent: v.optional(v.string()),
    referralSource: v.string(),
    createdAt: v.number(),
  })
    .index('by_referrer', ['referrerUserId'])
    .index('by_referred', ['referredUserId'])
    .index('by_referred_clerk_id', ['referredClerkId']),
})

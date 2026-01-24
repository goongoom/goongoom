import type { QueryCtx } from "../_generated/server"

export async function getFriendClerkIds(
  ctx: QueryCtx,
  clerkId: string
): Promise<Set<string>> {
  const friendIds = new Set<string>()

  const [receivedQuestions, sentQuestions] = await Promise.all([
    ctx.db
      .query("questions")
      .withIndex("by_recipient", (q) => q.eq("recipientClerkId", clerkId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isAnonymous"), false),
          q.neq(q.field("answerId"), undefined),
          q.neq(q.field("senderClerkId"), undefined)
        )
      )
      .collect(),
    ctx.db
      .query("questions")
      .withIndex("by_sender", (q) => q.eq("senderClerkId", clerkId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isAnonymous"), false),
          q.neq(q.field("answerId"), undefined)
        )
      )
      .collect(),
  ])

  for (const question of receivedQuestions) {
    if (question.senderClerkId && question.senderClerkId !== clerkId) {
      friendIds.add(question.senderClerkId)
    }
  }

  for (const question of sentQuestions) {
    if (question.recipientClerkId !== clerkId) {
      friendIds.add(question.recipientClerkId)
    }
  }

  return friendIds
}

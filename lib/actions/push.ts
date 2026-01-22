"use server"

import { auth } from "@clerk/nextjs/server"
import { fetchMutation, fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"

export async function subscribeToPush(subscription: {
  endpoint: string
  keys: { p256dh: string; auth: string }
}): Promise<{ success: boolean }> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false }
  }

  await fetchMutation(api.push.upsert, {
    clerkId: userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  })

  return { success: true }
}

export async function unsubscribeFromPush(
  endpoint: string
): Promise<{ success: boolean }> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false }
  }

  await fetchMutation(api.push.remove, {
    clerkId: userId,
    endpoint,
  })

  return { success: true }
}

export async function getPushSubscriptions(clerkId: string) {
  return await fetchQuery(api.push.getByClerkId, { clerkId })
}

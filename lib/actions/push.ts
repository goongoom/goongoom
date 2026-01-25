'use server'

import { auth } from '@clerk/nextjs/server'
import { fetchMutation, fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'

async function getAuthToken() {
  return (await (await auth()).getToken({ template: 'convex' })) ?? undefined
}

export async function subscribeToPush(subscription: {
  endpoint: string
  keys: { p256dh: string; auth: string }
}): Promise<{ success: boolean }> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false }
  }

  const token = await getAuthToken()
  await fetchMutation(
    api.push.upsert,
    {
      clerkId: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { token }
  )

  return { success: true }
}

export async function unsubscribeFromPush(endpoint: string): Promise<{ success: boolean }> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false }
  }

  const token = await getAuthToken()
  await fetchMutation(api.push.remove, { clerkId: userId, endpoint }, { token })

  return { success: true }
}

export async function getPushSubscriptions(clerkId: string) {
  const token = await getAuthToken()
  return await fetchQuery(api.push.getByClerkId, { clerkId }, { token })
}

export async function sendTestPushNotification(): Promise<{
  success: boolean
  error?: string
}> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: 'Not authenticated' }
  }

  const token = await getAuthToken()
  const subscriptions = await fetchQuery(api.push.getByClerkId, { clerkId: userId }, { token })

  if (subscriptions.length === 0) {
    return { success: false, error: 'No subscriptions found' }
  }

  const { sendPushToMany } = await import('@/lib/push')

  await sendPushToMany(
    subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      p256dh: sub.p256dh,
      auth: sub.auth,
    })),
    {
      title: 'Test Notification',
      body: 'Push notifications are working!',
      url: '/settings',
    }
  )

  return { success: true }
}

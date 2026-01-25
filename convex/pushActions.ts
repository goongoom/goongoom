'use node'

import { v } from 'convex/values'
import webpush from 'web-push'
import { internal } from './_generated/api'
import { action, internalAction } from './_generated/server'

export const sendTestNotification = action({
  args: { clerkId: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return { success: false, error: 'Authentication required' }
    }
    if (identity.subject !== args.clerkId) {
      return { success: false, error: 'Not authorized' }
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
    const vapidSubject = process.env.VAPID_SUBJECT

    if (!(vapidPublicKey && vapidPrivateKey && vapidSubject)) {
      return { success: false, error: 'Push notifications not configured' }
    }

    const subscriptions = await ctx.runQuery(internal.push.getByClerkIdInternal, { clerkId: args.clerkId })

    if (subscriptions.length === 0) {
      return { success: false, error: 'No subscriptions found' }
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

    const payload = JSON.stringify({
      title: 'Test Notification',
      body: 'Push notifications are working!',
      url: '/settings',
    })

    const results = await Promise.allSettled(
      subscriptions.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        )
      )
    )

    const anySuccess = results.some((r: PromiseSettledResult<unknown>) => r.status === 'fulfilled')
    return anySuccess ? { success: true } : { success: false, error: 'Failed to send notification' }
  },
})

export const sendNotification = internalAction({
  args: {
    recipientClerkId: v.string(),
    title: v.string(),
    body: v.string(),
    url: v.string(),
    tag: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
    const vapidSubject = process.env.VAPID_SUBJECT

    if (!(vapidPublicKey && vapidPrivateKey && vapidSubject)) {
      console.error('Push notifications not configured')
      return
    }

    const subscriptions = await ctx.runQuery(internal.push.getByClerkIdInternal, {
      clerkId: args.recipientClerkId,
    })

    if (subscriptions.length === 0) {
      return
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      url: args.url,
      tag: args.tag,
    })

    await Promise.allSettled(
      subscriptions.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        )
      )
    )
  },
})

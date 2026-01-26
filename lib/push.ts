import webpush from 'web-push'
import { getServerEnv } from '@/env'

const env = getServerEnv()
const vapidPublicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = env.VAPID_PRIVATE_KEY
const vapidSubject = env.VAPID_SUBJECT

if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

export interface PushSubscriptionData {
  endpoint: string
  p256dh: string
  auth: string
}

export async function sendPushNotification(subscription: PushSubscriptionData, payload: PushPayload): Promise<boolean> {
  if (!(vapidPublicKey && vapidPrivateKey)) {
    return false
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    )
    return true
  } catch {
    return false
  }
}

export async function sendPushToMany(subscriptions: PushSubscriptionData[], payload: PushPayload): Promise<void> {
  if (!(vapidPublicKey && vapidPrivateKey)) {
    return
  }

  await Promise.allSettled(subscriptions.map((sub) => sendPushNotification(sub, payload)))
}

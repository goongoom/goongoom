"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useRef } from "react"
import { subscribeToPush } from "@/lib/actions/push"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null
  }
  try {
    return await navigator.serviceWorker.register("/sw.js")
  } catch {
    return null
  }
}

async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  if (!VAPID_PUBLIC_KEY) {
    return null
  }

  try {
    const existingSubscription =
      await registration.pushManager.getSubscription()
    if (existingSubscription) {
      return existingSubscription
    }

    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        VAPID_PUBLIC_KEY
      ) as BufferSource,
    })
  } catch {
    return null
  }
}

export function PushNotificationProvider() {
  const { user, isLoaded } = useUser()
  const hasSubscribed = useRef(false)

  useEffect(() => {
    if (!(isLoaded && user) || hasSubscribed.current) {
      return
    }

    if (!("Notification" in window && "PushManager" in window)) {
      return
    }

    if (Notification.permission === "denied") {
      return
    }

    const setupPush = async () => {
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission()
        if (permission !== "granted") {
          return
        }
      }

      const registration = await registerServiceWorker()
      if (!registration) {
        return
      }

      const subscription = await subscribeToPushNotifications(registration)
      if (!subscription) {
        return
      }

      const subscriptionJson = subscription.toJSON()
      if (subscriptionJson.endpoint && subscriptionJson.keys) {
        hasSubscribed.current = true
        await subscribeToPush({
          endpoint: subscriptionJson.endpoint,
          keys: {
            p256dh: subscriptionJson.keys.p256dh ?? "",
            auth: subscriptionJson.keys.auth ?? "",
          },
        })
      }
    }

    setupPush()
  }, [isLoaded, user])

  return null
}

/// <reference lib="webworker" />

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) {
    return
  }

  const data = event.data.json()
  const { title, body, icon, badge, url, tag } = data

  const options = {
    body: body || '',
    icon: icon || '/icons/icon-192.png',
    badge: badge || '/icons/icon-192.png',
    tag: tag || 'default',
    data: { url: url || '/' },
    vibrate: [100, 50, 100],
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(title || 'Goongoom', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

function shouldSkipPrefetch() {
  if (typeof navigator === 'undefined') return false
  if (!('connection' in navigator)) return false
  const connection = navigator.connection as { saveData?: boolean }
  return Boolean(connection.saveData)
}

export function usePrefetchQuestionRoutes(routes: string[], enabled = true) {
  const router = useRouter()
  const prefetched = useRef(new Set<string>())

  useEffect(() => {
    if (!enabled || shouldSkipPrefetch()) {
      return
    }

    for (const route of routes) {
      if (!route || prefetched.current.has(route)) {
        continue
      }

      prefetched.current.add(route)
      router.prefetch(route)
    }
  }, [enabled, routes, router])
}

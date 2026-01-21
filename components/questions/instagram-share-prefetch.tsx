"use client"

import { useEffect } from "react"

interface InstagramSharePrefetchProps {
  imageUrl: string
}

export function InstagramSharePrefetch({
  imageUrl,
}: InstagramSharePrefetchProps) {
  useEffect(() => {
    let cancelled = false

    async function prefetch() {
      try {
        const response = await fetch(imageUrl, { cache: "force-cache" })
        if (cancelled || !response.ok) {
          return
        }
        await response.blob()
      } catch {
        /* empty */
      }
    }

    prefetch()
    return () => {
      cancelled = true
    }
  }, [imageUrl])

  return null
}

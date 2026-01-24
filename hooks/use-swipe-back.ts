"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

const EDGE_THRESHOLD = 30
const SWIPE_THRESHOLD = 100
const VERTICAL_THRESHOLD = 50

export function useSwipeBack() {
  const router = useRouter()
  const startX = useRef(0)
  const startY = useRef(0)

  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      const touch = e.touches[0]
      if (!touch) {
        return
      }
      startX.current = touch.clientX
      startY.current = touch.clientY
    }

    function handleTouchEnd(e: TouchEvent) {
      const touch = e.changedTouches[0]
      if (!touch) {
        return
      }

      const deltaX = touch.clientX - startX.current
      const deltaY = Math.abs(touch.clientY - startY.current)

      const isEdgeSwipe = startX.current < EDGE_THRESHOLD
      const isHorizontalSwipe =
        deltaX > SWIPE_THRESHOLD && deltaY < VERTICAL_THRESHOLD

      if (isEdgeSwipe && isHorizontalSwipe) {
        router.back()
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [router])
}

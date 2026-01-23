"use client"

import { useLayoutEffect, useRef, useState } from "react"

interface ClampedAnswerProps {
  content: string
}

export function ClampedAnswer({ content }: ClampedAnswerProps) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [isClamped, setIsClamped] = useState(false)

  useLayoutEffect(() => {
    const element = textRef.current
    if (!element) {
      return
    }

    const checkClamped = () => {
      setIsClamped(element.scrollHeight > element.clientHeight)
    }

    checkClamped()

    const resizeObserver = new ResizeObserver(checkClamped)
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div className="relative">
      <p className="line-clamp-4 leading-relaxed" ref={textRef}>
        {content}
      </p>
      {isClamped && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-emerald to-transparent" />
      )}
    </div>
  )
}

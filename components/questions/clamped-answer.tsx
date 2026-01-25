'use client'

import { useLayoutEffect, useRef, useState } from 'react'

interface ClampedAnswerProps {
  content: string
  gradientColors?: {
    light: string
    dark: string
  }
}

export function ClampedAnswer({ content, gradientColors }: ClampedAnswerProps) {
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

  const gradientStyle = gradientColors
    ? ({
        '--clamp-gradient-light': `linear-gradient(to top, ${gradientColors.light}, transparent)`,
        '--clamp-gradient-dark': `linear-gradient(to top, ${gradientColors.dark}, transparent)`,
      } as React.CSSProperties)
    : undefined

  return (
    <div className="relative">
      <p className="line-clamp-4 leading-relaxed" ref={textRef}>
        {content}
      </p>
      {isClamped && (
        <div
          className={
            gradientColors
              ? 'pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-[var(--clamp-gradient-light)] dark:bg-[var(--clamp-gradient-dark)]'
              : 'pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-emerald to-transparent'
          }
          style={gradientStyle}
        />
      )}
    </div>
  )
}

'use client'

import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentProps, FocusEvent, MouseEvent, TouchEvent } from 'react'
import { imageCache, prefetchImage } from './prefetch-cache'
import { useUltralink } from './use-ultralink'

type NextLinkProps = ComponentProps<typeof NextLink>

interface UltralinkProps extends NextLinkProps {
  prefetchImages?: string[]
  prefetchDebounce?: number
}

export function Ultralink({
  children,
  prefetch = true,
  prefetchImages = [],
  prefetchDebounce = 300,
  onFocus,
  onMouseEnter,
  onMouseDown,
  onNavigate,
  onTouchStart,
  ...props
}: UltralinkProps) {
  const router = useRouter()
  const href = String(props.href)

  const shouldPrefetch = prefetch !== false
  const ref = useUltralink({
    href,
    prefetch: shouldPrefetch,
    prefetchImages,
    debounceMs: prefetchDebounce,
  })

  const prefetchAssets = () => {
    if (!shouldPrefetch) {
      return
    }

    router.prefetch(href)

    const cachedImages = imageCache.get(href) || prefetchImages
    for (const src of cachedImages) {
      prefetchImage(src)
    }
  }

  const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    prefetchAssets()

    onMouseEnter?.(e)
  }

  const handleFocus = (e: FocusEvent<HTMLAnchorElement>) => {
    prefetchAssets()
    onFocus?.(e)
  }

  const handleMouseDown = (e: MouseEvent<HTMLAnchorElement>) => {
    const url = new URL(href, window.location.href)
    if (
      url.origin === window.location.origin &&
      e.button === 0 &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.shiftKey
    ) {
      e.preventDefault()
      router.push(href)
    }

    onMouseDown?.(e)
  }

  const handleTouchStart = (e: TouchEvent<HTMLAnchorElement>) => {
    prefetchAssets()
    onTouchStart?.(e)
  }

  const handleNavigate = (e: Parameters<NonNullable<NextLinkProps['onNavigate']>>[0]) => {
    document.documentElement.dataset.navDirection = 'forward'
    onNavigate?.(e)
  }

  return (
    <NextLink
      onFocus={handleFocus}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onNavigate={handleNavigate}
      onTouchStart={handleTouchStart}
      prefetch={shouldPrefetch}
      ref={ref}
      {...props}
    >
      {children}
    </NextLink>
  )
}

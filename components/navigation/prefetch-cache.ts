export const seenRoutes = new Set<string>()
export const seenImages = new Set<string>()
export const imageCache = new Map<string, string[]>()

export function prefetchImage(src: string): void {
  if (!src || seenImages.has(src)) {
    return
  }
  seenImages.add(src)

  const img = new Image()
  img.decoding = 'async'
  img.fetchPriority = 'low'
  img.src = src
}

export function markRouteSeen(href: string): boolean {
  if (seenRoutes.has(href)) {
    return false
  }
  seenRoutes.add(href)
  return true
}

export function clearPrefetchCaches(): void {
  seenRoutes.clear()
  seenImages.clear()
  imageCache.clear()
}

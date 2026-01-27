import { SiGithub, SiInstagram, SiNaver, SiThreads, SiX, SiYoutube } from '@icons-pack/react-simple-icons'
import type { SocialLinkEntry, SocialLinks } from '@/lib/types'

const HTTPS_PROTOCOL_REGEX = /^https?:\/\//i
const LEADING_SLASHES_REGEX = /^\/+/
const HANDLE_PREFIX_REGEX = /^@/
const URL_PATTERN_REGEX =
  /:\/\/|\/|instagram\.com|twitter\.com|x\.com|youtube\.com|youtu\.be|github\.com|blog\.naver\.com|naver\.com|threads\.net|www\./i

const NON_ASCII_REGEX = /[^\x20-\x7E]/g

const HANDLE_PLATFORMS = new Set(['instagram', 'twitter', 'youtube', 'threads'])
const CUSTOM_LABEL_PLATFORMS = new Set(['github', 'naverBlog'])

function toProfileUrl(value: string | undefined, domain: string) {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  if (HTTPS_PROTOCOL_REGEX.test(trimmed)) {
    return trimmed
  }
  if (trimmed.includes(domain)) {
    return `https://${trimmed.replace(LEADING_SLASHES_REGEX, '')}`
  }
  const handle = trimmed.split('/')[0]?.replace(HANDLE_PREFIX_REGEX, '')
  return handle ? `https://${domain}/${handle}` : null
}

function toYoutubeUrl(value: string | undefined) {
  if (!value) {
    return null
  }
  const trimmed = value.trim().replace(HANDLE_PREFIX_REGEX, '')
  if (!trimmed) {
    return null
  }
  if (HTTPS_PROTOCOL_REGEX.test(trimmed)) {
    return trimmed
  }
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return `https://${trimmed.replace(LEADING_SLASHES_REGEX, '')}`
  }
  if (trimmed.startsWith('UC') && trimmed.length >= 24) {
    return `https://www.youtube.com/channel/${trimmed}`
  }
  return `https://www.youtube.com/@${trimmed}`
}

export function stripNonAscii(value: string) {
  return value.replace(NON_ASCII_REGEX, '')
}

export function normalizeHandle(value: string) {
  const trimmed = stripNonAscii(value).trim()
  if (!trimmed) {
    return ''
  }
  const normalized = trimmed.replace(HANDLE_PREFIX_REGEX, '')
  if (!URL_PATTERN_REGEX.test(normalized)) {
    return normalized
  }
  try {
    const url = new URL(normalized.startsWith('http') ? normalized : `https://${normalized}`)
    const parts = url.pathname.split('/').filter(Boolean)
    const firstPart = parts[0] || ''
    return firstPart.replace(HANDLE_PREFIX_REGEX, '')
  } catch {
    return normalized.split('/').filter(Boolean)[0]?.replace(HANDLE_PREFIX_REGEX, '') || ''
  }
}

export function normalizeYoutubeHandle(value: string) {
  const trimmed = stripNonAscii(value).trim()
  if (!trimmed) {
    return ''
  }
  const normalized = trimmed.replace(HANDLE_PREFIX_REGEX, '')
  if (!URL_PATTERN_REGEX.test(normalized)) {
    return normalized
  }
  try {
    const url = new URL(normalized.startsWith('http') ? normalized : `https://${normalized}`)
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 'channel' && parts[1]) {
      return parts[1]
    }
    const firstPart = parts[0] || ''
    return firstPart.replace(HANDLE_PREFIX_REGEX, '')
  } catch {
    const parts = normalized.split('/').filter(Boolean)
    if (parts[0] === 'channel' && parts[1]) {
      return parts[1]
    }
    return parts[0]?.replace(HANDLE_PREFIX_REGEX, '') || ''
  }
}

export function normalizeNaverBlogHandle(value: string) {
  const trimmed = stripNonAscii(value).trim()
  if (!trimmed) {
    return ''
  }
  const normalized = trimmed.replace(HANDLE_PREFIX_REGEX, '')
  if (!URL_PATTERN_REGEX.test(normalized)) {
    return normalized
  }
  try {
    const url = new URL(normalized.startsWith('http') ? normalized : `https://${normalized}`)
    const blogId = url.searchParams.get('blogId')
    if (blogId) {
      return blogId
    }
    const parts = url.pathname.split('/').filter(Boolean)
    return parts[0] || ''
  } catch {
    return normalized.split('/').filter(Boolean)[0] || ''
  }
}

function formatHandleLabel(handle: string) {
  if (!handle) {
    return ''
  }
  if (handle.startsWith('UC') && handle.length >= 24) {
    return handle
  }
  return handle.replace(HANDLE_PREFIX_REGEX, '')
}

function normalizeHandleEntry(entry: SocialLinkEntry, normalize: (value: string) => string): SocialLinkEntry | null {
  const rawHandle = typeof entry.content === 'string' ? entry.content : entry.content.handle
  const handle = normalize(rawHandle || '')
  if (!handle) {
    return null
  }
  return { platform: entry.platform, content: handle, labelType: 'handle' }
}

function normalizeCustomEntry(entry: SocialLinkEntry, normalize: (value: string) => string): SocialLinkEntry | null {
  const rawHandle = typeof entry.content === 'string' ? entry.content : entry.content.handle
  const handle = normalize(rawHandle || '')
  if (!handle) {
    return null
  }
  const label = typeof entry.content === 'string' ? handle : entry.content.label.trim() || handle
  return {
    platform: entry.platform,
    content: { handle, label },
    labelType: 'custom',
  }
}

function normalizeSocialLinkEntry(entry: SocialLinkEntry): SocialLinkEntry | null {
  if (HANDLE_PLATFORMS.has(entry.platform)) {
    const normalize = entry.platform === 'youtube' ? normalizeYoutubeHandle : normalizeHandle
    return normalizeHandleEntry(entry, normalize)
  }

  if (CUSTOM_LABEL_PLATFORMS.has(entry.platform)) {
    const normalize = entry.platform === 'naverBlog' ? normalizeNaverBlogHandle : normalizeHandle
    return normalizeCustomEntry(entry, normalize)
  }

  return null
}

function normalizeSocialLinks(socialLinks: SocialLinks | null | undefined) {
  if (!Array.isArray(socialLinks)) {
    return []
  }
  return socialLinks
    .map((entry) => normalizeSocialLinkEntry(entry))
    .filter((entry): entry is SocialLinkEntry => Boolean(entry))
}

interface SocialLinkItem {
  key: string
  label: string
  icon: typeof SiInstagram
  href: string
  text: string
}

export interface SocialLabels {
  instagram: string
  twitter: string
  youtube: string
  github: string
  naverBlog: string
  threads: string
}

const DEFAULT_LABELS: SocialLabels = {
  instagram: 'Instagram',
  twitter: 'X',
  youtube: 'YouTube',
  github: 'GitHub',
  naverBlog: 'Naver Blog',
  threads: 'Threads',
}

export function buildSocialLinks(
  socialLinks: SocialLinks | null | undefined,
  labels?: Partial<SocialLabels>
): SocialLinkItem[] {
  const normalized = normalizeSocialLinks(socialLinks)
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels }

  return normalized
    .map((entry, index) => {
      if (entry.platform === 'instagram' && typeof entry.content === 'string') {
        return {
          key: `instagram-${entry.content}-${index}`,
          label: resolvedLabels.instagram,
          icon: SiInstagram,
          href: toProfileUrl(entry.content, 'instagram.com'),
          text: formatHandleLabel(entry.content),
        }
      }
      if (entry.platform === 'twitter' && typeof entry.content === 'string') {
        return {
          key: `twitter-${entry.content}-${index}`,
          label: resolvedLabels.twitter,
          icon: SiX,
          href: toProfileUrl(entry.content, 'x.com'),
          text: formatHandleLabel(entry.content),
        }
      }
      if (entry.platform === 'youtube' && typeof entry.content === 'string') {
        return {
          key: `youtube-${entry.content}-${index}`,
          label: resolvedLabels.youtube,
          icon: SiYoutube,
          href: toYoutubeUrl(entry.content),
          text: formatHandleLabel(entry.content),
        }
      }
      if (entry.platform === 'github' && typeof entry.content !== 'string') {
        return {
          key: `github-${entry.content.handle}-${index}`,
          label: resolvedLabels.github,
          icon: SiGithub,
          href: toProfileUrl(entry.content.handle, 'github.com'),
          text: entry.content.handle,
        }
      }
      if (entry.platform === 'naverBlog' && typeof entry.content !== 'string') {
        return {
          key: `naver-${entry.content.handle}-${index}`,
          label: resolvedLabels.naverBlog,
          icon: SiNaver,
          href: toProfileUrl(entry.content.handle, 'blog.naver.com'),
          text: entry.content.label || entry.content.handle,
        }
      }
      if (entry.platform === 'threads' && typeof entry.content === 'string') {
        return {
          key: `threads-${entry.content}-${index}`,
          label: resolvedLabels.threads,
          icon: SiThreads,
          href: toProfileUrl(entry.content, 'www.threads.net'),
          text: formatHandleLabel(entry.content),
        }
      }
      return null
    })
    .filter((link): link is SocialLinkItem => Boolean(link?.href))
}

export function canAskAnonymousQuestion(securityLevel: string, viewerIsVerified: boolean) {
  if (securityLevel === 'public_only') {
    return false
  }
  return securityLevel === 'anyone' || viewerIsVerified
}

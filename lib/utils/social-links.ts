import {
  BloggerIcon,
  GithubIcon,
  InstagramIcon,
  NewTwitterIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons"
import type { SocialLinkEntry, SocialLinks } from "@/lib/types"

export const HTTPS_PROTOCOL_REGEX = /^https?:\/\//i
export const LEADING_SLASHES_REGEX = /^\/+/
export const HANDLE_PREFIX_REGEX = /^@/
export const URL_PATTERN_REGEX =
  /:\/\/|\/|instagram\.com|twitter\.com|x\.com|youtube\.com|youtu\.be|github\.com|blog\.naver\.com|naver\.com|www\./i
export const HTML_TITLE_REGEX = /<title[^>]*>([^<]+)<\/title>/i

const HANDLE_PLATFORMS = new Set(["instagram", "twitter", "youtube"])
const CUSTOM_LABEL_PLATFORMS = new Set(["github", "naverBlog"])

export function toProfileUrl(value: string | undefined, domain: string) {
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
    return `https://${trimmed.replace(LEADING_SLASHES_REGEX, "")}`
  }
  const handle = trimmed.split("/")[0]?.replace(HANDLE_PREFIX_REGEX, "")
  return handle ? `https://${domain}/${handle}` : null
}

function toYoutubeUrl(value: string | undefined) {
  if (!value) {
    return null
  }
  const trimmed = value.trim().replace(HANDLE_PREFIX_REGEX, "")
  if (!trimmed) {
    return null
  }
  if (HTTPS_PROTOCOL_REGEX.test(trimmed)) {
    return trimmed
  }
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    return `https://${trimmed.replace(LEADING_SLASHES_REGEX, "")}`
  }
  if (trimmed.startsWith("UC") && trimmed.length >= 24) {
    return `https://www.youtube.com/channel/${trimmed}`
  }
  return `https://www.youtube.com/@${trimmed}`
}

export function normalizeHandle(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }
  const normalized = trimmed.replace(HANDLE_PREFIX_REGEX, "")
  if (!URL_PATTERN_REGEX.test(normalized)) {
    return normalized
  }
  try {
    const url = new URL(
      normalized.startsWith("http") ? normalized : `https://${normalized}`
    )
    const parts = url.pathname.split("/").filter(Boolean)
    const firstPart = parts[0] || ""
    return firstPart.replace(HANDLE_PREFIX_REGEX, "")
  } catch {
    return (
      normalized
        .split("/")
        .filter(Boolean)[0]
        ?.replace(HANDLE_PREFIX_REGEX, "") || ""
    )
  }
}

export function normalizeYoutubeHandle(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }
  const normalized = trimmed.replace(HANDLE_PREFIX_REGEX, "")
  if (!URL_PATTERN_REGEX.test(normalized)) {
    return normalized
  }
  try {
    const url = new URL(
      normalized.startsWith("http") ? normalized : `https://${normalized}`
    )
    const parts = url.pathname.split("/").filter(Boolean)
    if (parts[0] === "channel" && parts[1]) {
      return parts[1]
    }
    const firstPart = parts[0] || ""
    return firstPart.replace(HANDLE_PREFIX_REGEX, "")
  } catch {
    const parts = normalized.split("/").filter(Boolean)
    if (parts[0] === "channel" && parts[1]) {
      return parts[1]
    }
    return parts[0]?.replace(HANDLE_PREFIX_REGEX, "") || ""
  }
}

export function normalizeNaverBlogHandle(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }
  const normalized = trimmed.replace(HANDLE_PREFIX_REGEX, "")
  if (!URL_PATTERN_REGEX.test(normalized)) {
    return normalized
  }
  try {
    const url = new URL(
      normalized.startsWith("http") ? normalized : `https://${normalized}`
    )
    const blogId = url.searchParams.get("blogId")
    if (blogId) {
      return blogId
    }
    const parts = url.pathname.split("/").filter(Boolean)
    return parts[0] || ""
  } catch {
    return normalized.split("/").filter(Boolean)[0] || ""
  }
}

function formatHandleLabel(handle: string) {
  if (!handle) {
    return ""
  }
  if (handle.startsWith("UC") && handle.length >= 24) {
    return handle
  }
  return handle.startsWith("@") ? handle : `@${handle}`
}

function normalizeHandleEntry(
  entry: SocialLinkEntry,
  normalize: (value: string) => string
): SocialLinkEntry | null {
  const rawHandle =
    typeof entry.content === "string" ? entry.content : entry.content.handle
  const handle = normalize(rawHandle || "")
  if (!handle) {
    return null
  }
  return { platform: entry.platform, content: handle, labelType: "handle" }
}

function normalizeCustomEntry(
  entry: SocialLinkEntry,
  normalize: (value: string) => string
): SocialLinkEntry | null {
  const rawHandle =
    typeof entry.content === "string" ? entry.content : entry.content.handle
  const handle = normalize(rawHandle || "")
  if (!handle) {
    return null
  }
  const label =
    typeof entry.content === "string"
      ? handle
      : entry.content.label.trim() || handle
  return {
    platform: entry.platform,
    content: { handle, label },
    labelType: "custom",
  }
}

function normalizeSocialLinkEntry(
  entry: SocialLinkEntry
): SocialLinkEntry | null {
  if (HANDLE_PLATFORMS.has(entry.platform)) {
    const normalize =
      entry.platform === "youtube" ? normalizeYoutubeHandle : normalizeHandle
    return normalizeHandleEntry(entry, normalize)
  }

  if (CUSTOM_LABEL_PLATFORMS.has(entry.platform)) {
    const normalize =
      entry.platform === "naverBlog"
        ? normalizeNaverBlogHandle
        : normalizeHandle
    return normalizeCustomEntry(entry, normalize)
  }

  return null
}

export function normalizeSocialLinks(
  socialLinks: SocialLinks | null | undefined
) {
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
  icon: typeof InstagramIcon
  href: string
  text: string
}

export interface SocialLabels {
  instagram: string
  twitter: string
  youtube: string
  github: string
  naverBlog: string
}

const DEFAULT_LABELS: SocialLabels = {
  instagram: "Instagram",
  twitter: "X",
  youtube: "YouTube",
  github: "GitHub",
  naverBlog: "Naver Blog",
}

const NAVER_BLOG_TITLE_SUFFIX = ": 네이버 블로그"

export async function fetchNaverBlogTitle(handle: string): Promise<string> {
  if (!handle) {
    return handle
  }
  try {
    const url = `https://blog.naver.com/${handle}`
    const response = await fetch(url, {
      next: { revalidate: 86_400 },
    })
    if (!response.ok) {
      return handle
    }
    const html = await response.text()
    const titleMatch = HTML_TITLE_REGEX.exec(html)
    if (!titleMatch?.[1]) {
      return handle
    }
    let title = titleMatch[1]
    if (title.endsWith(NAVER_BLOG_TITLE_SUFFIX)) {
      title = title.slice(0, -NAVER_BLOG_TITLE_SUFFIX.length)
    }
    return title.trim() || handle
  } catch {
    return handle
  }
}

export function buildSocialLinks(
  socialLinks: SocialLinks | null | undefined,
  labels?: Partial<SocialLabels>
): SocialLinkItem[] {
  const normalized = normalizeSocialLinks(socialLinks)
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels }

  return normalized
    .map((entry, index) => {
      if (entry.platform === "instagram" && typeof entry.content === "string") {
        return {
          key: `instagram-${entry.content}-${index}`,
          label: resolvedLabels.instagram,
          icon: InstagramIcon,
          href: toProfileUrl(entry.content, "instagram.com"),
          text: formatHandleLabel(entry.content),
        }
      }
      if (entry.platform === "twitter" && typeof entry.content === "string") {
        return {
          key: `twitter-${entry.content}-${index}`,
          label: resolvedLabels.twitter,
          icon: NewTwitterIcon,
          href: toProfileUrl(entry.content, "x.com"),
          text: formatHandleLabel(entry.content),
        }
      }
      if (entry.platform === "youtube" && typeof entry.content === "string") {
        return {
          key: `youtube-${entry.content}-${index}`,
          label: resolvedLabels.youtube,
          icon: YoutubeIcon,
          href: toYoutubeUrl(entry.content),
          text: formatHandleLabel(entry.content),
        }
      }
      if (entry.platform === "github" && typeof entry.content !== "string") {
        return {
          key: `github-${entry.content.handle}-${index}`,
          label: resolvedLabels.github,
          icon: GithubIcon,
          href: toProfileUrl(entry.content.handle, "github.com"),
          text: entry.content.handle,
        }
      }
      if (entry.platform === "naverBlog" && typeof entry.content !== "string") {
        return {
          key: `naver-${entry.content.handle}-${index}`,
          label: resolvedLabels.naverBlog,
          icon: BloggerIcon,
          href: toProfileUrl(entry.content.handle, "blog.naver.com"),
          text: entry.content.label || entry.content.handle,
        }
      }
      return null
    })
    .filter((link): link is SocialLinkItem => Boolean(link?.href))
}

export function getPageStatus(
  error: string | null,
  sent: boolean,
  questionSentMessage: string
) {
  if (error) {
    return { type: "error" as const, message: error }
  }
  if (sent) {
    return { type: "success" as const, message: questionSentMessage }
  }
  return null
}

export function canAskAnonymousQuestion(
  securityLevel: string,
  viewerIsVerified: boolean
) {
  if (securityLevel === "public_only") {
    return false
  }
  return securityLevel === "anyone" || viewerIsVerified
}

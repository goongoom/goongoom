import { InstagramIcon, NewTwitterIcon } from "@hugeicons/core-free-icons"

export const HTTPS_PROTOCOL_REGEX = /^https?:\/\//i
export const LEADING_SLASHES_REGEX = /^\/+/
export const URL_PATTERN_REGEX =
  /:\/\/|\/|instagram\.com|twitter\.com|x\.com|www\./i

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
  const handle = trimmed.split("/")[0]
  return handle ? `https://${domain}/${handle}` : null
}

export function normalizeHandle(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }
  if (!URL_PATTERN_REGEX.test(trimmed)) {
    return trimmed
  }
  try {
    const url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    )
    const parts = url.pathname.split("/").filter(Boolean)
    return parts[0] || ""
  } catch {
    return trimmed.split("/").filter(Boolean)[0] || ""
  }
}

interface SocialLinkItem {
  key: string
  label: string
  icon: typeof InstagramIcon
  href: string
}

export function buildSocialLinks(
  socialLinks: { instagram?: string; twitter?: string } | null | undefined
): SocialLinkItem[] {
  const links = [
    {
      key: "instagram",
      label: "Instagram",
      icon: InstagramIcon,
      href: toProfileUrl(socialLinks?.instagram, "instagram.com"),
    },
    {
      key: "twitter",
      label: "X",
      icon: NewTwitterIcon,
      href: toProfileUrl(socialLinks?.twitter, "x.com"),
    },
  ]
  return links.filter((link): link is SocialLinkItem => link.href !== null)
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

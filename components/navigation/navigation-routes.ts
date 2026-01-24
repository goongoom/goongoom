export const TAB_ROUTES = ["/", "/inbox", "/friends", "/settings"] as const

export const AUTH_REQUIRED_ROUTES = [
  "/inbox",
  "/friends",
  "/settings",
  "/settings/profile",
] as const

export const PUBLIC_ROUTES = ["/", "/terms", "/privacy", "/contact"] as const

export type TabRoute = (typeof TAB_ROUTES)[number]
export type AuthRequiredRoute = (typeof AUTH_REQUIRED_ROUTES)[number]
export type PublicRoute = (typeof PUBLIC_ROUTES)[number]

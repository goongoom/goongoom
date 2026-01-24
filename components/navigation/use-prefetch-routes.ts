"use client"

import { useUser } from "@clerk/nextjs"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { AUTH_REQUIRED_ROUTES } from "./navigation-routes"

interface UsePrefetchRoutesOptions {
  enabled?: boolean
}

export function usePrefetchRoutes(
  routes: readonly string[],
  options: UsePrefetchRoutesOptions = {}
) {
  const { enabled = true } = options
  const router = useRouter()
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    if (!(enabled && isLoaded)) {
      return
    }

    const shouldPrefetch = (route: string) => {
      if (route === pathname) {
        return false
      }

      const requiresAuth = AUTH_REQUIRED_ROUTES.some(
        (authRoute) => route === authRoute || route.startsWith(`${authRoute}/`)
      )

      if (requiresAuth && !isSignedIn) {
        return false
      }

      return true
    }

    const routesToPrefetch = routes.filter(shouldPrefetch)

    if (routesToPrefetch.length === 0) {
      return
    }

    const prefetchRoutes = () => {
      for (const route of routesToPrefetch) {
        router.prefetch(route)
      }
    }

    if (
      typeof navigator !== "undefined" &&
      "connection" in navigator &&
      (navigator.connection as { saveData?: boolean })?.saveData
    ) {
      return
    }

    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(prefetchRoutes, { timeout: 2000 })
      return () => cancelIdleCallback(id)
    }

    const id = setTimeout(prefetchRoutes, 100)
    return () => clearTimeout(id)
  }, [enabled, isLoaded, isSignedIn, pathname, router, routes])
}

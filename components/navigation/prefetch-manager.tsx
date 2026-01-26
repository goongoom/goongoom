'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import { convex } from '@/lib/convex/client'
import { AUTH_REQUIRED_ROUTES, GUEST_TAB_ROUTES, TAB_ROUTES } from './navigation-routes'

function shouldSkipPrefetch() {
  if (typeof navigator === 'undefined') return false
  if (!('connection' in navigator)) return false
  const connection = navigator.connection as { saveData?: boolean }
  return Boolean(connection.saveData)
}

export function PrefetchManager() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const { isAuthenticated } = useConvexAuth()
  const prefetchedRoutesFor = useRef<'guest' | 'authed' | null>(null)
  const prefetchedDataFor = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded || shouldSkipPrefetch()) {
      return
    }

    const nextState = isSignedIn ? 'authed' : 'guest'
    if (prefetchedRoutesFor.current === nextState) {
      return
    }

    prefetchedRoutesFor.current = nextState
    const routes = isSignedIn
      ? Array.from(new Set([...TAB_ROUTES, ...AUTH_REQUIRED_ROUTES]))
      : GUEST_TAB_ROUTES

    for (const route of routes) {
      router.prefetch(route)
    }

    if (isSignedIn && user?.username) {
      router.prefetch(`/${user.username}`)
    }
  }, [isLoaded, isSignedIn, router, user?.username])

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isAuthenticated || !user?.id || shouldSkipPrefetch()) {
      return
    }

    if (prefetchedDataFor.current === user.id) {
      return
    }

    prefetchedDataFor.current = user.id

    void convex.query(api.users.getByClerkId, { clerkId: user.id }).catch(() => null)
    void convex.query(api.questions.getUnanswered, { recipientClerkId: user.id }).catch(() => null)
    void convex.query(api.answers.getFriendsAnswers, { clerkId: user.id, limit: 30 }).catch(() => null)

    if (user.username) {
      void convex
        .query(api.users.getByUsername, { username: user.username })
        .then((dbUser) => {
          if (!dbUser?.clerkId) {
            return null
          }
          return convex.query(api.questions.getAnsweredByRecipient, { recipientClerkId: dbUser.clerkId })
        })
        .catch(() => null)
    }
  }, [isAuthenticated, isLoaded, isSignedIn, user?.id, user?.username])

  return null
}

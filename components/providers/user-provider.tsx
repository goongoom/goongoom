'use client'

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from 'convex-helpers/react/cache/hooks'
import { useConvexAuth } from 'convex/react'
import posthog from 'posthog-js'
import { api } from '@/convex/_generated/api'
import { SignatureColorProvider } from '@/components/theme/signature-color-provider'

interface CurrentUser {
  clerkId: string
  username: string | null
  firstName: string | null
  fullName: string | null
  avatarUrl: string | null
  bio: string | null
  signatureColor: string | null
  questionSecurityLevel: string | null
  locale: string | null
}

interface UserContextValue {
  user: CurrentUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextValue | null>(null)

export function useCurrentUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useCurrentUser must be used within UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const { userId } = useAuth()
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
  const identifiedRef = useRef<string | null>(null)

  const dbUser = useQuery(api.users.getByClerkId, userId ? { clerkId: userId } : 'skip')

  const isLoading = isAuthLoading || (isAuthenticated && (dbUser === undefined || dbUser === null))

  // Identify user in PostHog when authenticated
  useEffect(() => {
    if (dbUser && identifiedRef.current !== dbUser.clerkId) {
      posthog.identify(dbUser.clerkId, {
        username: dbUser.username,
        firstName: dbUser.firstName,
        fullName: dbUser.fullName,
        locale: dbUser.locale,
      })
      identifiedRef.current = dbUser.clerkId
    } else if (!isAuthenticated && identifiedRef.current) {
      // Reset PostHog when user logs out
      posthog.reset()
      identifiedRef.current = null
    }
  }, [dbUser, isAuthenticated])

  const user = useMemo<CurrentUser | null>(() => {
    if (!dbUser) return null
    return {
      clerkId: dbUser.clerkId,
      username: dbUser.username ?? null,
      firstName: dbUser.firstName ?? null,
      fullName: dbUser.fullName ?? null,
      avatarUrl: dbUser.avatarUrl ?? null,
      bio: dbUser.bio ?? null,
      signatureColor: dbUser.signatureColor ?? null,
      questionSecurityLevel: dbUser.questionSecurityLevel ?? null,
      locale: dbUser.locale ?? null,
    }
  }, [dbUser])

  const contextValue = useMemo<UserContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
    }),
    [user, isLoading, isAuthenticated]
  )

  return (
    <UserContext.Provider value={contextValue}>
      <SignatureColorProvider signatureColor={user?.signatureColor}>{children}</SignatureColorProvider>
    </UserContext.Provider>
  )
}

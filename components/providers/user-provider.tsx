'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SignatureColorProvider } from '@/components/theme/signature-color-provider'

interface CurrentUser {
  clerkId: string
  username: string | null
  displayName: string | null
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

  const dbUser = useQuery(api.users.getByClerkId, userId ? { clerkId: userId } : 'skip')

  const isLoading = isAuthLoading || (isAuthenticated && (dbUser === undefined || dbUser === null))

  const user = useMemo<CurrentUser | null>(() => {
    if (!dbUser) return null
    return {
      clerkId: dbUser.clerkId,
      username: dbUser.username ?? null,
      displayName: dbUser.displayName ?? null,
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

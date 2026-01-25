'use client'

import { useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { AppShell } from '@/components/layout/app-shell'
import { api } from '@/convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'

type UnansweredQuestion = NonNullable<FunctionReturnType<typeof api.questions.getUnanswered>>[number]

interface AppShellWrapperProps {
  children: React.ReactNode
}

export function AppShellWrapper({ children }: AppShellWrapperProps) {
  const { userId: clerkId } = useAuth()

  const questions = useQuery(api.questions.getUnanswered, clerkId ? { recipientClerkId: clerkId } : 'skip')

  const recentQuestions = useMemo(() => {
    if (!questions) return []

    return questions.slice(0, 5).map((q: UnansweredQuestion) => ({
      id: q._id,
      content: q.content,
      createdAt: q._creationTime,
      senderName: q.isAnonymous ? undefined : q.senderFirstName || q.senderUsername || undefined,
      senderAvatarUrl: q.isAnonymous ? null : q.senderAvatarUrl || null,
      isAnonymous: q.isAnonymous,
    }))
  }, [questions])

  const isLoggedIn = !!clerkId

  return (
    <AppShell isLoggedIn={isLoggedIn} recentQuestions={recentQuestions}>
      {children}
    </AppShell>
  )
}

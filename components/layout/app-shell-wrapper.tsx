import { auth } from "@clerk/nextjs/server"
import { AppShell } from "@/components/layout/app-shell"
import { getClerkUsersByIds } from "@/lib/clerk"
import { getUnansweredQuestions } from "@/lib/db/queries"

interface AppShellWrapperProps {
  children: React.ReactNode
}

export async function AppShellWrapper({ children }: AppShellWrapperProps) {
  const { userId: clerkId } = await auth()

  let recentQuestions: Array<{
    id: string
    content: string
    createdAt: number
    senderName?: string
    senderAvatarUrl?: string | null
    isAnonymous?: boolean
  }> = []

  if (clerkId) {
    const questions = (await getUnansweredQuestions(clerkId)) ?? []
    const recentFive = questions
      .filter((q): q is NonNullable<typeof q> => q !== null)
      .slice(0, 5)

    const senderIds = Array.from(
      new Set(
        recentFive
          .map((q) => (q.isAnonymous ? undefined : q.senderClerkId))
          .filter((id): id is string => id !== undefined)
      )
    )

    const senderMap =
      senderIds.length > 0 ? await getClerkUsersByIds(senderIds) : new Map()

    recentQuestions = recentFive.map((q) => {
      const sender =
        !q.isAnonymous && q.senderClerkId
          ? senderMap.get(q.senderClerkId)
          : null

      return {
        id: q._id,
        content: q.content,
        createdAt: q._creationTime,
        senderName: sender?.displayName || sender?.username || undefined,
        senderAvatarUrl: sender?.avatarUrl || null,
        isAnonymous: q.isAnonymous,
      }
    })
  }

  return <AppShell recentQuestions={recentQuestions}>{children}</AppShell>
}

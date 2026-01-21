import type { User } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"

export interface ClerkUserInfo {
  clerkId: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  email: string | null
}

export async function getClerkUserByUsername(
  username: string
): Promise<ClerkUserInfo | null> {
  try {
    const client = await clerkClient()
    const { data: users } = await client.users.getUserList({
      username: [username],
      limit: 1,
    })

    const user = users[0]
    if (!user) {
      return null
    }

    return clerkUserToInfo(user)
  } catch (error) {
    console.error("Error fetching Clerk user by username:", error)
    return null
  }
}

export async function getClerkUserById(
  clerkId: string
): Promise<ClerkUserInfo | null> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(clerkId)
    return clerkUserToInfo(user)
  } catch (error) {
    console.error("Error fetching Clerk user by ID:", error)
    return null
  }
}

export async function getClerkUsersByIds(
  clerkIds: string[]
): Promise<Map<string, ClerkUserInfo>> {
  if (clerkIds.length === 0) {
    return new Map()
  }

  try {
    const client = await clerkClient()
    const { data: users } = await client.users.getUserList({
      userId: clerkIds,
      limit: 100,
    })

    const map = new Map<string, ClerkUserInfo>()
    for (const user of users) {
      map.set(user.id, clerkUserToInfo(user))
    }
    return map
  } catch (error) {
    console.error("Error fetching Clerk users by IDs:", error)
    return new Map()
  }
}

function clerkUserToInfo(user: User): ClerkUserInfo {
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || null

  return {
    clerkId: user.id,
    username: user.username,
    displayName,
    avatarUrl: user.imageUrl,
    email: user.primaryEmailAddress?.emailAddress || null,
  }
}

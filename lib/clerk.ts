import type { User } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import { cache } from "react"

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

async function fetchClerkUserById(
  clerkId: string
): Promise<ClerkUserInfo | null> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(clerkId)
    return clerkUserToInfo(user)
  } catch (error) {
    console.error("Error fetching Clerk user by ID:", clerkId, error)
    return null
  }
}

export const getClerkUserById = cache(fetchClerkUserById)

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
  } catch (batchError) {
    console.error(
      "Batch fetch failed, falling back to individual lookups:",
      batchError
    )
    const map = new Map<string, ClerkUserInfo>()
    const results = await Promise.all(
      clerkIds.map((id) => getClerkUserById(id).then((user) => ({ id, user })))
    )
    for (const { id, user } of results) {
      if (user) {
        map.set(id, user)
      }
    }
    return map
  }
}

function clerkUserToInfo(user: User): ClerkUserInfo {
  const displayName = user.firstName || null

  return {
    clerkId: user.id,
    username: user.username,
    displayName,
    avatarUrl: user.imageUrl,
    email: user.primaryEmailAddress?.emailAddress || null,
  }
}

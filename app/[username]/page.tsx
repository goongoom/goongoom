import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { clientEnv } from '@/env'
import UserProfilePage from './user-profile'

export async function generateStaticParams() {
  const convex = new ConvexHttpClient(clientEnv.NEXT_PUBLIC_CONVEX_URL)
  try {
    const usernames = await convex.query(api.users.listAllUsernames, {})
    return usernames.map((username) => ({ username }))
  } catch (error) {
    console.warn('[generateStaticParams] /[username] skipped', error)
    return []
  }
}

export default function Page() {
  return <UserProfilePage />
}

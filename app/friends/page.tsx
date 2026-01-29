import { auth } from '@clerk/nextjs/server'
import { preloadQuery } from 'convex/nextjs'
import { redirect } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import { FriendsContent } from './friends-content'

export default async function FriendsPage() {
  const { userId, getToken } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const token = await getToken({ template: 'convex' })

  const preloadedFriendsAnswers = await preloadQuery(
    api.answers.getFriendsAnswers,
    { clerkId: userId, limit: 30 },
    { token: token! }
  )

  return <FriendsContent preloadedFriendsAnswers={preloadedFriendsAnswers} />
}

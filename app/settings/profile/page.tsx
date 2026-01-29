import { auth } from '@clerk/nextjs/server'
import { preloadQuery } from 'convex/nextjs'
import { redirect } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import { ProfileSettingsContent } from './profile-settings-content'

export default async function ProfileSettingsPage() {
  const { userId, getToken } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const token = await getToken({ template: 'convex' })

  const preloadedUser = await preloadQuery(api.users.getByClerkId, { clerkId: userId }, { token: token! })

  return <ProfileSettingsContent preloadedUser={preloadedUser} />
}

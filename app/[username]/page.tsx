import type { Metadata } from 'next'
import { ConvexHttpClient } from 'convex/browser'
import { preloadQuery, preloadedQueryResult } from 'convex/nextjs'
import { getTranslations } from 'next-intl/server'
import { api } from '@/convex/_generated/api'
import { env } from '@/env.vercel'
import { getUserLocale } from '@/i18n/get-user-locale'
import UserProfilePage from './user-profile'

export async function generateStaticParams() {
  const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL)
  try {
    const usernames = await convex.query(api.users.listAllUsernames, {})
    return usernames.map((username) => ({ username }))
  } catch (error) {
    console.warn('[generateStaticParams] /[username] skipped', error)
    return []
  }
}

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL)
  const dbUser = await convex.query(api.users.getByUsername, { username })
  if (!dbUser) return { title: 'Goongoom' }

  const locale = getUserLocale(dbUser.locale)
  const [tNav, tOg] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'og' }),
  ])
  const firstName = dbUser.firstName || dbUser.username || username

  return {
    title: tNav('userAppName', { firstName }),
    description: tOg('tagline'),
  }
}

export default async function Page({ params }: PageProps) {
  const { username } = await params

  const preloadedUser = await preloadQuery(api.users.getByUsername, { username })
  const user = preloadedQueryResult(preloadedUser)

  const recipientClerkId = user?.clerkId || ''

  const preloadedQuestions = await preloadQuery(api.questions.getAnsweredByRecipient, {
    recipientClerkId,
  })

  return <UserProfilePage preloadedUser={preloadedUser} preloadedQuestions={preloadedQuestions} />
}

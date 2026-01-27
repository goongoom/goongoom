import type { Metadata } from 'next'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { clientEnv } from '@/env'
import type { QuestionId } from '@/lib/types'
import QADetailPage from './qa-detail'

export async function generateStaticParams() {
  const convex = new ConvexHttpClient(clientEnv.NEXT_PUBLIC_CONVEX_URL)
  try {
    const params = await convex.query(api.questions.listAllAnsweredParams, {})
    return params.map(({ username, questionId }) => ({ username, questionId }))
  } catch (error) {
    console.warn('[generateStaticParams] /[username]/q/[questionId] skipped', error)
    return []
  }
}

interface PageProps {
  params: Promise<{ username: string; questionId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, questionId: questionIdParam } = await params
  const convex = new ConvexHttpClient(clientEnv.NEXT_PUBLIC_CONVEX_URL)
  const dbUser = await convex.query(api.users.getByUsername, { username })
  if (!dbUser) return { title: 'Goongoom' }

  const qa = await convex.query(api.questions.getByIdAndRecipient, {
    id: questionIdParam as QuestionId,
    recipientClerkId: dbUser.clerkId,
  })
  if (!qa?.answer) return { title: 'Goongoom' }

  return {
    title: qa.content,
    description: qa.answer.content,
  }
}

export default function Page() {
  return <QADetailPage />
}

import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { clientEnv } from '@/env'
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

export default function Page() {
  return <QADetailPage />
}

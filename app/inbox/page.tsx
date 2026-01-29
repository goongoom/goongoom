import { auth } from '@clerk/nextjs/server'
import { preloadQuery } from 'convex/nextjs'
import { redirect } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import { InboxContent } from './inbox-content'

export default async function InboxPage() {
  const { userId, getToken } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const token = await getToken({ template: 'convex' })

  const preloadedQuestions = await preloadQuery(
    api.questions.getUnanswered,
    { recipientClerkId: userId },
    { token: token! }
  )

  return <InboxContent preloadedQuestions={preloadedQuestions} />
}

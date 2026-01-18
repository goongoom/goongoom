import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getClerkUserByUsername } from '@/lib/clerk'
import { getQuestionsByRecipient, getAnswersForQuestion } from '@/lib/db/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    
    const clerkUser = await getClerkUserByUsername(username)
    if (!clerkUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    const questions = await getQuestionsByRecipient(clerkUser.clerkId)
    
    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => {
        const answers = await getAnswersForQuestion(q.id)
        return { ...q, answers }
      })
    )
    
    return NextResponse.json(questionsWithAnswers)
  } catch (error) {
    console.error('Questions fetch error:', error)
    return NextResponse.json(
      { error: '질문을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

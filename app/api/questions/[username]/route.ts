import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getClerkUserByUsername } from '@/lib/clerk'
import { getQuestionsWithAnswers } from '@/lib/db/queries'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { searchParams } = new URL(request.url)
    
    const limit = Math.min(
      Number(searchParams.get('limit')) || DEFAULT_LIMIT,
      MAX_LIMIT
    )
    const offset = Number(searchParams.get('offset')) || 0
    
    const clerkUser = await getClerkUserByUsername(username)
    if (!clerkUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    const questionsWithAnswers = await getQuestionsWithAnswers(
      clerkUser.clerkId,
      { limit, offset }
    )
    
    return NextResponse.json({
      data: questionsWithAnswers,
      pagination: { limit, offset, hasMore: questionsWithAnswers.length === limit }
    })
  } catch (error) {
    console.error('Questions fetch error:', error)
    return NextResponse.json(
      { error: '질문을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

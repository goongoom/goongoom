import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAnswer, getQuestionById } from '@/lib/db/queries'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { questionId, content } = body
    
    if (!questionId || !content) {
      return NextResponse.json(
        { error: '질문 ID와 답변 내용은 필수입니다' },
        { status: 400 }
      )
    }
    
    const question = await getQuestionById(Number(questionId))
    if (!question) {
      return NextResponse.json(
        { error: '질문을 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    if (question.recipientClerkId !== clerkId) {
      return NextResponse.json(
        { error: '본인에게 온 질문만 답변할 수 있습니다' },
        { status: 403 }
      )
    }
    
    const answer = await createAnswer({
      questionId: Number(questionId),
      content,
    })
    
    return NextResponse.json(answer[0], { status: 201 })
  } catch (error) {
    console.error('Answer creation error:', error)
    return NextResponse.json(
      { error: '답변 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

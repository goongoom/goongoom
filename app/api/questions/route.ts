import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createQuestion, getOrCreateUser } from '@/lib/db/queries'

export async function POST(request: NextRequest) {
  try {
    const { userId: senderClerkId } = await auth()
    const body = await request.json()
    
    const { recipientClerkId, content, isAnonymous } = body
    
    if (!recipientClerkId || !content) {
      return NextResponse.json(
        { error: '수신자와 질문 내용은 필수입니다' },
        { status: 400 }
      )
    }
    
    await getOrCreateUser(recipientClerkId)
    
    const question = await createQuestion({
      recipientClerkId,
      senderClerkId: isAnonymous ? null : senderClerkId,
      content,
      isAnonymous: isAnonymous ? 1 : 0,
    })
    
    return NextResponse.json(question[0], { status: 201 })
  } catch (error) {
    console.error('Question creation error:', error)
    return NextResponse.json(
      { error: '질문 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

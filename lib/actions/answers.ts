'use server'

import { auth } from '@clerk/nextjs/server'
import { createAnswer as createAnswerDB, getQuestionById } from '@/lib/db/queries'
import type { Answer } from '@/lib/types'

export type AnswerActionResult<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: string }

export async function createAnswer(data: {
  questionId: number
  content: string
}): Promise<AnswerActionResult<Answer>> {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return { success: false, error: '로그인이 필요합니다' }
    }
    
    const { questionId, content } = data
    
    if (!questionId || !content) {
      return { success: false, error: '질문 ID와 답변 내용은 필수입니다' }
    }
    
    const question = await getQuestionById(Number(questionId))
    if (!question) {
      return { success: false, error: '질문을 찾을 수 없습니다' }
    }
    
    if (question.recipientClerkId !== clerkId) {
      return { success: false, error: '본인에게 온 질문만 답변할 수 있습니다' }
    }
    
    const [answer] = await createAnswerDB({
      questionId: Number(questionId),
      content,
    })
    
    if (!answer) {
      return { success: false, error: '답변 생성에 실패했습니다' }
    }
    
    return { success: true, data: answer }
  } catch (error) {
    console.error('Answer creation error:', error)
    return { success: false, error: '답변 생성 중 오류가 발생했습니다' }
  }
}

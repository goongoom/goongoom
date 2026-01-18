'use server'

import { auth } from '@clerk/nextjs/server'
import { createQuestion as createQuestionDB, getOrCreateUser } from '@/lib/db/queries'
import { getClerkUserById } from '@/lib/clerk'
import type { Question } from '@/lib/types'
import { DEFAULT_QUESTION_SECURITY_LEVEL } from '@/lib/question-security'

export type QuestionActionResult<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: string }

export async function createQuestion(data: {
  recipientClerkId: string
  content: string
  isAnonymous: boolean
}): Promise<QuestionActionResult<Question>> {
  try {
    const { userId } = await auth()
    const senderClerkId = userId ?? null
    
    const { recipientClerkId, content, isAnonymous } = data
    
    if (!recipientClerkId || !content) {
      return { success: false, error: '수신자와 질문 내용은 필수입니다' }
    }
    
    const recipientUser = await getClerkUserById(recipientClerkId)
    if (!recipientUser) {
      return { success: false, error: '존재하지 않는 사용자입니다' }
    }
    
    const recipientDbUser = await getOrCreateUser(recipientClerkId)
    const securityLevel =
      recipientDbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL

    if (!isAnonymous && !senderClerkId) {
      return {
        success: false,
        error: '공개 질문은 로그인 후 보낼 수 있습니다',
      }
    }

    if (securityLevel === 'public_only' && isAnonymous) {
      return {
        success: false,
        error: '이 사용자는 공개 질문만 받을 수 있습니다',
      }
    }

    if (securityLevel === 'verified_anonymous' && isAnonymous && !senderClerkId) {
      return {
        success: false,
        error: '익명 질문은 로그인한 사용자만 보낼 수 있습니다',
      }
    }
    
    const [question] = await createQuestionDB({
      recipientClerkId,
      senderClerkId,
      content,
      isAnonymous: isAnonymous ? 1 : 0,
    })
    
    if (!question) {
      return { success: false, error: '질문 생성에 실패했습니다' }
    }
    
    return { success: true, data: question }
  } catch (error) {
    console.error('Question creation error:', error)
    return { success: false, error: '질문 생성 중 오류가 발생했습니다' }
  }
}

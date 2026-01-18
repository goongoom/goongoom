import type { User as DBUser, Question as DBQuestion, Answer as DBAnswer, SocialLinks } from '@/src/db/schema'
import type { ClerkUserInfo } from '@/lib/clerk'
import type { QuestionSecurityLevel } from '@/lib/question-security'

export type User = DBUser
export type Question = DBQuestion
export type Answer = DBAnswer
export type { SocialLinks, ClerkUserInfo, QuestionSecurityLevel }

export type QuestionWithAnswers = Question & {
  answers: Answer[]
}

export type QAItem = {
  question: Question
  answer: Answer
  recipientClerkId: string
  recipientInfo?: ClerkUserInfo
}

export type UserProfile = {
  clerkId: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  socialLinks: SocialLinks | null
  questionSecurityLevel: QuestionSecurityLevel
}

export type APIResponse<T> = {
  data?: T
  error?: string
}

export type CreateQuestionRequest = {
  recipientClerkId: string
  content: string
  isAnonymous: boolean
}

export type CreateAnswerRequest = {
  questionId: number
  content: string
}

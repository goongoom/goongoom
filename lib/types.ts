import type { ClerkUserInfo } from "@/lib/clerk"
import type { SocialLinks } from "@/lib/db/queries"
import type { QuestionSecurityLevel } from "@/lib/question-security"

export interface User {
  _id: string
  _creationTime: number
  clerkId: string
  bio?: string
  socialLinks?: SocialLinks
  questionSecurityLevel: string
  updatedAt: number
}

export interface Question {
  _id: string
  _creationTime: number
  recipientClerkId: string
  senderClerkId?: string
  content: string
  isAnonymous: boolean
}

export interface Answer {
  _id: string
  _creationTime: number
  questionId: string
  content: string
}

export type QuestionWithAnswers = Question & {
  answers: Answer[]
}

export interface QAItem {
  question: Question | null
  answer: Answer
  recipientClerkId: string
  recipientInfo?: ClerkUserInfo
}

export interface UserProfile {
  clerkId: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  socialLinks: SocialLinks | null
  questionSecurityLevel: QuestionSecurityLevel
}

export type { ClerkUserInfo } from "@/lib/clerk"
export type { SocialLinks } from "@/lib/db/queries"
export type { QuestionSecurityLevel } from "@/lib/question-security"

export interface APIResponse<T> {
  data?: T
  error?: string
}

export interface CreateQuestionRequest {
  recipientClerkId: string
  content: string
  isAnonymous: boolean
}

export interface CreateAnswerRequest {
  questionId: number
  content: string
}

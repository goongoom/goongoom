import type { ClerkUserInfo } from "@/lib/clerk"
import type { QuestionSecurityLevel } from "@/lib/question-security"
import type {
  Answer as DBAnswer,
  Question as DBQuestion,
  User as DBUser,
  SocialLinks,
} from "@/src/db/schema"

export type User = DBUser
export type Question = DBQuestion
export type Answer = DBAnswer

export type QuestionWithAnswers = Question & {
  answers: Answer[]
}

export interface QAItem {
  question: Question
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
export type { QuestionSecurityLevel } from "@/lib/question-security"
export type { SocialLinks } from "@/src/db/schema"

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

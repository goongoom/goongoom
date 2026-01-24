import type { Doc, Id } from "./_generated/dataModel"

export type { Doc, Id } from "./_generated/dataModel"

export type User = Doc<"users">
export type Question = Doc<"questions">
export type Answer = Doc<"answers">
export type PushSubscription = Doc<"pushSubscriptions">
export type Log = Doc<"logs">

export type UserId = Id<"users">
export type QuestionId = Id<"questions">
export type AnswerId = Id<"answers">
export type PushSubscriptionId = Id<"pushSubscriptions">
export type LogId = Id<"logs">

export interface SocialLinks {
  instagram?: string[] | string
  facebook?: string
  github?: { handle: string; label?: string }[] | string
  naverBlog?: { handle: string; label?: string }[] | string
  twitter?: string[] | string
  youtube?: string[] | string
}

export interface QuestionWithAnswer extends Question {
  answer: Answer | null | undefined
}

export interface QAItem {
  question: Question | null
  answer: Answer
  recipientClerkId: string
}

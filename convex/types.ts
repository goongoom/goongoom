import type { Doc, Id } from './_generated/dataModel'

export type { Doc, Id } from './_generated/dataModel'

export type User = Doc<'users'>
export type Question = Doc<'questions'>
export type Answer = Doc<'answers'>
export type PushSubscription = Doc<'pushSubscriptions'>
export type Log = Doc<'logs'>

export type UserId = Id<'users'>
export type QuestionId = Id<'questions'>
export type AnswerId = Id<'answers'>
export type PushSubscriptionId = Id<'pushSubscriptions'>
export type LogId = Id<'logs'>

export type SocialLinkPlatform = 'instagram' | 'twitter' | 'youtube' | 'github' | 'naverBlog' | 'threads'

export type SocialLinkLabelType = 'handle' | 'custom'

export type SocialLinkContent = string | { handle: string; label: string }

export interface SocialLinkEntry {
  platform: SocialLinkPlatform
  content: SocialLinkContent
  labelType: SocialLinkLabelType
}

export type SocialLinks = SocialLinkEntry[]

export interface QuestionWithAnswer extends Question {
  answer: Answer | null | undefined
}

export interface QAItem {
  question: Question | null
  answer: Answer
  recipientClerkId: string
}

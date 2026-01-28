'use node'

import { v } from 'convex/values'
import { internalAction } from './_generated/server'

type SlackBlock =
  | { type: 'section'; text: { type: 'mrkdwn'; text: string } }
  | { type: 'context'; elements: Array<{ type: 'mrkdwn'; text: string }> }
  | { type: 'divider' }

interface SlackMessage {
  text: string
  blocks?: SlackBlock[]
}

async function sendSlackMessage(webhookUrl: string, message: SlackMessage): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
    return response.ok
  } catch (error) {
    console.error('Failed to send Slack message:', error)
    return false
  }
}

export const notifyUserSignup = internalAction({
  args: {
    username: v.optional(v.string()),
    clerkId: v.string(),
    referrerUsername: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<void> => {
    const webhookUrl = process.env.SLACK_ADMIN_WEBHOOK_URL
    if (!webhookUrl) {
      return
    }

    const userDisplay = args.username ? `@${args.username}` : `(${args.clerkId.slice(0, 8)}...)`
    const referralInfo = args.referrerUsername ? ` (referred by @${args.referrerUsername})` : ''

    await sendSlackMessage(webhookUrl, {
      text: `New user signup: ${userDisplay}${referralInfo}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:wave: *New User Signup*\n\nUser: *${userDisplay}*${referralInfo}`,
          },
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `Clerk ID: \`${args.clerkId}\`` }],
        },
      ],
    })
  },
})

export const notifyUserDeleted = internalAction({
  args: {
    username: v.optional(v.string()),
    clerkId: v.string(),
    source: v.union(v.literal('webhook'), v.literal('self')),
  },
  handler: async (_ctx, args): Promise<void> => {
    const webhookUrl = process.env.SLACK_ADMIN_WEBHOOK_URL
    if (!webhookUrl) {
      return
    }

    const userDisplay = args.username ? `@${args.username}` : `(${args.clerkId.slice(0, 8)}...)`
    const sourceText = args.source === 'self' ? 'self-deleted' : 'deleted via Clerk'

    await sendSlackMessage(webhookUrl, {
      text: `User deleted: ${userDisplay} (${sourceText})`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:wave: *User Deleted*\n\nUser: *${userDisplay}*\nSource: ${sourceText}`,
          },
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `Clerk ID: \`${args.clerkId}\`` }],
        },
      ],
    })
  },
})

export const notifyNewQuestion = internalAction({
  args: {
    recipientUsername: v.optional(v.string()),
    recipientClerkId: v.string(),
    senderUsername: v.optional(v.string()),
    isAnonymous: v.boolean(),
    questionPreview: v.string(),
  },
  handler: async (_ctx, args): Promise<void> => {
    const webhookUrl = process.env.SLACK_ADMIN_WEBHOOK_URL
    if (!webhookUrl) {
      return
    }

    const recipientDisplay = args.recipientUsername
      ? `@${args.recipientUsername}`
      : `(${args.recipientClerkId.slice(0, 8)}...)`
    const senderDisplay = args.isAnonymous ? 'Anonymous' : args.senderUsername ? `@${args.senderUsername}` : 'Unknown'
    const preview =
      args.questionPreview.length > 100 ? `${args.questionPreview.slice(0, 100)}...` : args.questionPreview

    await sendSlackMessage(webhookUrl, {
      text: `New question to ${recipientDisplay} from ${senderDisplay}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:question: *New Question*\n\nTo: *${recipientDisplay}*\nFrom: ${senderDisplay}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `> ${preview}`,
          },
        },
      ],
    })
  },
})

export const notifyNewAnswer = internalAction({
  args: {
    answererUsername: v.optional(v.string()),
    answererClerkId: v.string(),
    answerPreview: v.string(),
  },
  handler: async (_ctx, args): Promise<void> => {
    const webhookUrl = process.env.SLACK_ADMIN_WEBHOOK_URL
    if (!webhookUrl) {
      return
    }

    const answererDisplay = args.answererUsername
      ? `@${args.answererUsername}`
      : `(${args.answererClerkId.slice(0, 8)}...)`
    const preview = args.answerPreview.length > 100 ? `${args.answerPreview.slice(0, 100)}...` : args.answerPreview

    await sendSlackMessage(webhookUrl, {
      text: `New answer from ${answererDisplay}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:speech_balloon: *New Answer*\n\nFrom: *${answererDisplay}*`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `> ${preview}`,
          },
        },
      ],
    })
  },
})

export const notifyQuestionDeleted = internalAction({
  args: {
    recipientUsername: v.optional(v.string()),
    recipientClerkId: v.string(),
  },
  handler: async (_ctx, args): Promise<void> => {
    const webhookUrl = process.env.SLACK_ADMIN_WEBHOOK_URL
    if (!webhookUrl) {
      return
    }

    const userDisplay = args.recipientUsername
      ? `@${args.recipientUsername}`
      : `(${args.recipientClerkId.slice(0, 8)}...)`

    await sendSlackMessage(webhookUrl, {
      text: `Question declined by ${userDisplay}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:wastebasket: *Question Declined*\n\nBy: *${userDisplay}*`,
          },
        },
      ],
    })
  },
})

export const notifyAnswerDeleted = internalAction({
  args: {
    answererUsername: v.optional(v.string()),
    answererClerkId: v.string(),
  },
  handler: async (_ctx, args): Promise<void> => {
    const webhookUrl = process.env.SLACK_ADMIN_WEBHOOK_URL
    if (!webhookUrl) {
      return
    }

    const userDisplay = args.answererUsername ? `@${args.answererUsername}` : `(${args.answererClerkId.slice(0, 8)}...)`

    await sendSlackMessage(webhookUrl, {
      text: `Answer deleted by ${userDisplay}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:wastebasket: *Answer Deleted*\n\nBy: *${userDisplay}*`,
          },
        },
      ],
    })
  },
})

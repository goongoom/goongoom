'use node'

import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalAction } from './_generated/server'

async function detectLanguageViaAI(text: string, apiKey: string): Promise<string> {
  const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-5.2',
      messages: [
        {
          role: 'system',
          content:
            'Detect the language of the given text. Return ONLY the ISO 639-1 two-letter language code (e.g. en, ko, ja, zh, es, fr, de, pt, ru, ar). Nothing else.',
        },
        { role: 'user', content: text },
      ],
      max_tokens: 5,
      temperature: 0,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI Gateway returned ${response.status}`)
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>
  }
  const content = data.choices[0]?.message?.content
  if (!content) {
    throw new Error('AI Gateway returned empty response')
  }
  return content.trim().toLowerCase().slice(0, 2)
}

export const detectQuestionLanguage = internalAction({
  args: {
    questionId: v.id('questions'),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const apiKey = process.env.AI_GATEWAY_API_KEY
    if (!apiKey) {
      console.error('AI_GATEWAY_API_KEY not configured, skipping language detection')
      return
    }

    try {
      const language = await detectLanguageViaAI(args.content, apiKey)
      await ctx.runMutation(internal.languageMutations.patchQuestionLanguage, {
        questionId: args.questionId,
        language,
      })
    } catch (error) {
      console.error('Language detection failed for question:', args.questionId, error)
    }
  },
})

export const detectAnswerLanguage = internalAction({
  args: {
    answerId: v.id('answers'),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const apiKey = process.env.AI_GATEWAY_API_KEY
    if (!apiKey) {
      console.error('AI_GATEWAY_API_KEY not configured, skipping language detection')
      return
    }

    try {
      const language = await detectLanguageViaAI(args.content, apiKey)
      await ctx.runMutation(internal.languageMutations.patchAnswerLanguage, {
        answerId: args.answerId,
        language,
      })
    } catch (error) {
      console.error('Language detection failed for answer:', args.answerId, error)
    }
  },
})

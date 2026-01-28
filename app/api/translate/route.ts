import { streamText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { getPostHogClient } from '@/lib/posthog-server'

const localeNames: Record<string, string> = {
  ko: 'Korean',
  en: 'English',
  ja: 'Japanese',
}

export async function POST(request: Request) {
  const { text, targetLocale } = (await request.json()) as {
    text: string
    targetLocale: string
  }

  const targetLanguage = localeNames[targetLocale] || 'English'

  // Track translation request in PostHog (server-side, anonymous)
  const posthog = getPostHogClient()
  posthog.capture({
    distinctId: 'server-anonymous',
    event: 'translation_requested',
    properties: {
      target_locale: targetLocale,
      text_length: text.length,
    },
  })

  const result = streamText({
    model: gateway('openai/gpt-5.2'),
    system:
      'You are a translator. Translate the given text naturally and accurately. Output ONLY the translation, nothing else. Do not add quotes, labels, or explanations. If the text is already in the target language, output it unchanged.',
    prompt: `Translate the following text to ${targetLanguage}:\n\n${text}`,
  })

  return result.toTextStreamResponse()
}

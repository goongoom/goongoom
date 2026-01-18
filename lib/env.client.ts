import { z } from 'zod'

/**
 * Client Environment Variables (public - safe to expose to browser)
 * 
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY - Clerk publishable key
 * NEXT_PUBLIC_APP_URL               - App URL (http://localhost:3000)
 */

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().min(1).url(),
})

function validateClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  })
  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid client environment variables')
  }
  return parsed.data
}

export const clientEnv = validateClientEnv()

export type ClientEnv = z.infer<typeof clientSchema>

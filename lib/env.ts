import { z } from 'zod'

/**
 * Environment Variables - Self-documenting .env.example replacement
 * 
 * CLERK_SECRET_KEY          - From https://dashboard.clerk.com
 * CLERK_WEBHOOK_SECRET      - Create at https://dashboard.clerk.com/webhooks
 * DATABASE_URL              - PostgreSQL connection string
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY - Clerk publishable key
 * NEXT_PUBLIC_APP_URL       - App URL (http://localhost:3000)
 */

const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional().default(''),
  DATABASE_URL: z.string().min(1).url(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().min(1).url(),
})

function validateServerEnv() {
  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid server environment variables')
  }
  return parsed.data
}

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

export const serverEnv = typeof window === 'undefined' ? validateServerEnv() : null as never
export const clientEnv = validateClientEnv()

export type ServerEnv = z.infer<typeof serverSchema>
export type ClientEnv = z.infer<typeof clientSchema>

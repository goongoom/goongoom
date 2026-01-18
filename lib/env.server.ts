import { z } from 'zod'

/**
 * Server Environment Variables (secrets - never exposed to client)
 * 
 * CLERK_SECRET_KEY     - From https://dashboard.clerk.com
 * CLERK_WEBHOOK_SECRET - Create at https://dashboard.clerk.com/webhooks
 * DATABASE_URL         - PostgreSQL connection string
 */

const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional().default(''),
  DATABASE_URL: z.string().min(1).url(),
})

function validateServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv cannot be accessed on the client')
  }
  
  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid server environment variables')
  }
  return parsed.data
}

export const serverEnv = validateServerEnv()

export type ServerEnv = z.infer<typeof serverSchema>

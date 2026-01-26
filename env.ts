import { z } from 'zod'

const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.url().optional(),
  NEXT_PUBLIC_CONVEX_URL: z.url(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: z.url(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
})

let cachedServerEnv: z.infer<typeof serverSchema> | null = null

export function getServerEnv() {
  if (!cachedServerEnv) {
    cachedServerEnv = serverSchema.parse(process.env)
  }
  return cachedServerEnv
}

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
})

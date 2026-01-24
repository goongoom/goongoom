import { z } from 'zod'

const schema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.url().optional(),
  NEXT_PUBLIC_CONVEX_URL: z.url(),
})

export const env = schema.parse(process.env)

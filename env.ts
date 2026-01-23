import { z } from "zod"

const schema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional().default(""),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().url().optional(),
  NEXT_PUBLIC_CONVEX_CLOUD_URL: z.string().url(),
  NEXT_PUBLIC_CONVEX_SITE_URL: z.string().url(),
})

export const env = schema.parse(process.env)

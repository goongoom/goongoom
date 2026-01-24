import { z } from "zod"

const schema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.url().optional(),
})

export const serverEnv = schema.parse(process.env)

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { env } from "@/env"
// biome-ignore lint/performance/noNamespaceImport: Drizzle ORM requires full schema object
import * as schema from "./schema"

const connectionString = (() => {
  try {
    const url = new URL(env.DATABASE_URL)
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "verify-full")
    }
    return url.toString()
  } catch {
    return env.DATABASE_URL
  }
})()

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

export const db = drizzle(pool, { schema })

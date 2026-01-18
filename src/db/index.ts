import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { serverEnv } from '@/lib/env.server'

const connectionString = (() => {
  try {
    const url = new URL(serverEnv.DATABASE_URL)
    if (!url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'verify-full')
    }
    return url.toString()
  } catch {
    return serverEnv.DATABASE_URL
  }
})()

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

export const db = drizzle(pool, { schema })

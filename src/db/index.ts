import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { serverEnv } from '@/lib/env'

const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export const db = drizzle(pool, { schema })

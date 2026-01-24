import { fetchMutation } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import type { AuditLogEntry } from './types'

export async function logAuditEntry(entry: AuditLogEntry): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  try {
    await fetchMutation(api.logs.create, entry)
  } catch (error) {
    console.error('[Audit Logger] Failed to log audit entry:', error)
  }
}

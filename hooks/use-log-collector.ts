'use client'

import { useCallback } from 'react'
import { collectLog } from '@/lib/actions/collect-log'

interface LogActionData {
  action: string
  payload?: Record<string, unknown>
  entityType?: string
  entityId?: string
  success: boolean
  errorMessage?: string
}

export function useLogCollector() {
  const logAction = useCallback((data: LogActionData) => {
    collectLog(data).catch(() => {})
  }, [])

  return { logAction }
}

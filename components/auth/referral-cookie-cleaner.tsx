'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'

export function ReferralCookieCleaner() {
  const { userId } = useAuth()

  useEffect(() => {
    if (userId) {
      document.cookie = 'referral=; path=/; max-age=0'
    }
  }, [userId])

  return null
}

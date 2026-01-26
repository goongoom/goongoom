'use client'

import { useEffect, useRef } from 'react'
import { type Locale, locales } from '@/i18n/config'
import { localeStore } from '@/i18n/locale-store'
import { useCurrentUser } from './user-provider'

export function LocaleSync() {
  const { user, isLoading } = useCurrentUser()
  const prevLocaleRef = useRef<string | null>(null)

  const convexLocale = user?.locale ?? null

  useEffect(() => {
    if (isLoading) return
    if (!convexLocale) return
    if (!locales.includes(convexLocale as Locale)) return
    if (convexLocale === prevLocaleRef.current) return

    prevLocaleRef.current = convexLocale

    const current = localeStore.getSnapshot()
    if (convexLocale !== current) {
      localeStore.setLocale(convexLocale as Locale)
    }
  }, [convexLocale, isLoading])

  return null
}

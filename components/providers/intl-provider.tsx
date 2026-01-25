'use client'

import { NextIntlClientProvider } from 'next-intl'
import { useEffect, useSyncExternalStore, type ReactNode } from 'react'
import { defaultLocale, type Locale, locales } from '@/i18n/config'
import enMessages from '@/messages/en.json'
import jaMessages from '@/messages/ja.json'
import koMessages from '@/messages/ko.json'

const messages: Record<Locale, typeof koMessages> = {
  ko: koMessages,
  en: enMessages,
  ja: jaMessages,
}

const LOCALE_COOKIE = 'NEXT_LOCALE'

function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return defaultLocale
  const match = document.cookie.match(new RegExp(`(^| )${LOCALE_COOKIE}=([^;]+)`))
  const locale = match?.[2]
  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale
  }
  return defaultLocale
}

function subscribeToLocaleChanges(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getServerSnapshot(): Locale {
  return defaultLocale
}

interface IntlProviderProps {
  children: ReactNode
}

export function IntlProvider({ children }: IntlProviderProps) {
  const locale = useSyncExternalStore(subscribeToLocaleChanges, getLocaleFromCookie, getServerSnapshot)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  )
}

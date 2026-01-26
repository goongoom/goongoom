'use client'

import { NextIntlClientProvider } from 'next-intl'
import { useSyncExternalStore, type ReactNode } from 'react'
import { type Locale } from '@/i18n/config'
import { localeStore } from '@/i18n/locale-store'
import enMessages from '@/messages/en.json'
import jaMessages from '@/messages/ja.json'
import koMessages from '@/messages/ko.json'

const messages: Record<Locale, typeof koMessages> = {
  ko: koMessages,
  en: enMessages,
  ja: jaMessages,
}

interface IntlProviderProps {
  children: ReactNode
  initialLocale: Locale
}

export function IntlProvider({ children, initialLocale }: IntlProviderProps) {
  const locale = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getSnapshot,
    () => initialLocale
  )

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  )
}

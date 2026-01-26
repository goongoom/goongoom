import { type Locale, defaultLocale, locales } from './config'

const LOCALE_COOKIE = 'NEXT_LOCALE'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

let currentLocale: Locale = defaultLocale
const listeners = new Set<() => void>()

function detectBrowserLocale(): Locale | undefined {
  if (typeof navigator === 'undefined') return undefined
  const languages = navigator.languages ?? [navigator.language]
  for (const lang of languages) {
    const lower = lang.toLowerCase()
    for (const locale of locales) {
      if (lower === locale || lower.startsWith(`${locale}-`)) {
        return locale
      }
    }
  }
  return undefined
}

function readCookieLocale(): Locale {
  if (typeof document === 'undefined') return defaultLocale
  const match = document.cookie.match(new RegExp(`(^| )${LOCALE_COOKIE}=([^;]+)`))
  const value = match?.[2]
  if (value && locales.includes(value as Locale)) {
    return value as Locale
  }
  return detectBrowserLocale() ?? defaultLocale
}

if (typeof document !== 'undefined') {
  currentLocale = readCookieLocale()
}

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

export const localeStore = {
  getSnapshot(): Locale {
    return currentLocale
  },

  subscribe(callback: () => void): () => void {
    listeners.add(callback)
    return () => listeners.delete(callback)
  },

  setLocale(locale: Locale): void {
    if (currentLocale === locale) return
    currentLocale = locale

    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`
      document.documentElement.lang = locale
    }

    notify()
  },

  initialize(locale: Locale): void {
    currentLocale = locale
  },
}

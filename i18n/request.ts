import { cookies, headers } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, type Locale, locales } from './config'

const LOCALE_COOKIE = 'NEXT_LOCALE'

function parseAcceptLanguage(header: string): Locale | undefined {
  const entries = header
    .split(',')
    .map((part) => {
      const [lang, qPart] = part.trim().split(';')
      const q = qPart ? parseFloat(qPart.replace('q=', '')) : 1
      return { lang: lang?.trim().toLowerCase() ?? '', q }
    })
    .sort((a, b) => b.q - a.q)

  for (const { lang } of entries) {
    for (const locale of locales) {
      if (lang === locale || lang.startsWith(`${locale}-`)) {
        return locale
      }
    }
  }
  return undefined
}

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const locale = cookieStore.get(LOCALE_COOKIE)?.value
  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale
  }

  const headerStore = await headers()
  const acceptLanguage = headerStore.get('Accept-Language')
  if (acceptLanguage) {
    const detected = parseAcceptLanguage(acceptLanguage)
    if (detected) return detected
  }

  return defaultLocale
}

export default getRequestConfig(async () => {
  const locale = await getUserLocale()
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})

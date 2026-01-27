import { cookies, headers } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { type Locale, defaultLocale, locales } from './config'

function matchAcceptLanguage(header: string): Locale | undefined {
  const languages = header.split(',').map((lang) => lang.replace(/;.*$/, '').trim())
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

export default getRequestConfig(async () => {
  let locale: Locale = defaultLocale

  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale
  } else {
    const headerStore = await headers()
    const acceptLanguage = headerStore.get('accept-language')
    if (acceptLanguage) {
      locale = matchAcceptLanguage(acceptLanguage) ?? defaultLocale
    }
  }

  return {
    locale,
    timeZone: 'UTC',
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})

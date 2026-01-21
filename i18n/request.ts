import { cookies } from "next/headers"
import { getRequestConfig } from "next-intl/server"
import { defaultLocale, type Locale, locales } from "./config"

const LOCALE_COOKIE = "NEXT_LOCALE"

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const locale = cookieStore.get(LOCALE_COOKIE)?.value
  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale
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

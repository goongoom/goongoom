import { type Locale, defaultLocale, locales } from './config'

export function getUserLocale(userLocale: string | undefined | null): Locale {
  if (userLocale && locales.includes(userLocale as Locale)) {
    return userLocale as Locale
  }
  return defaultLocale
}

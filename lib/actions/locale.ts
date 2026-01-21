"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { type Locale, locales } from "@/i18n/config"

const LOCALE_COOKIE = "NEXT_LOCALE"
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

export async function setUserLocale(locale: Locale) {
  if (!locales.includes(locale)) {
    return { success: false, error: "Invalid locale" }
  }

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  })

  revalidatePath("/", "layout")
  return { success: true }
}

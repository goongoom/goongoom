'use server'

import { auth } from '@clerk/nextjs/server'
import { fetchMutation } from 'convex/nextjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { api } from '@/convex/_generated/api'
import { type Locale, locales } from '@/i18n/config'

const LOCALE_COOKIE = 'NEXT_LOCALE'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

async function getAuthToken() {
  return (await (await auth()).getToken({ template: 'convex' })) ?? undefined
}

export async function setUserLocale(locale: Locale) {
  if (!locales.includes(locale)) {
    return { success: false, error: 'Invalid locale' }
  }

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: 'lax',
  })

  const { userId } = await auth()
  if (userId) {
    const token = await getAuthToken()
    await fetchMutation(api.users.updateLocale, { clerkId: userId, locale }, { token })
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

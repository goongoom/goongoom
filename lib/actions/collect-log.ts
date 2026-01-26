'use server'

import { auth } from '@clerk/nextjs/server'
import { geolocation, ipAddress } from '@vercel/functions'
import { fetchMutation } from 'convex/nextjs'
import { headers } from 'next/headers'
import { api } from '@/convex/_generated/api'

interface CollectLogData {
  action: string
  payload?: Record<string, unknown>
  entityType?: string
  entityId?: string
  success: boolean
  errorMessage?: string
}

export async function collectLog(data: CollectLogData): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  try {
    const headersList = await headers()
    const request = { headers: headersList }
    const geo = geolocation(request)
    const { userId } = await auth()

    await fetchMutation(api.logs.create, {
      ipAddress: ipAddress(request) ?? undefined,
      geoCity: geo.city ?? undefined,
      geoCountry: geo.country ?? undefined,
      geoCountryFlag: geo.flag ?? undefined,
      geoRegion: geo.countryRegion ?? undefined,
      geoEdgeRegion: geo.region ?? undefined,
      geoLatitude: geo.latitude ?? undefined,
      geoLongitude: geo.longitude ?? undefined,
      geoPostalCode: geo.postalCode ?? undefined,
      userAgent: headersList.get('user-agent') ?? undefined,
      referer: headersList.get('referer') ?? undefined,
      acceptLanguage: headersList.get('accept-language') ?? undefined,
      userId: userId ?? undefined,
      action: data.action,
      payload: data.payload,
      entityType: data.entityType,
      entityId: data.entityId,
      success: data.success,
      errorMessage: data.errorMessage,
    })
  } catch (error) {
    console.error('[Log Collector] Failed to collect log:', error)
  }
}

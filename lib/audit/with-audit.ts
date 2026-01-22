import { auth } from "@clerk/nextjs/server"
import { geolocation, ipAddress } from "@vercel/functions"
import { headers } from "next/headers"
import { logAuditEntry } from "./logger"
import type { AuditRequestData, EntityType, JsonValue } from "./types"

interface WithAuditOptions {
  action: string
  payload: unknown
  entityType?: EntityType
}

function serializePayload(payload: unknown): JsonValue | undefined {
  if (payload === null || payload === undefined) {
    return undefined
  }
  try {
    return JSON.parse(JSON.stringify(payload)) as JsonValue
  } catch {
    return { _raw: String(payload), _type: typeof payload }
  }
}

function isSuccessResult(
  result: unknown
): result is { success: boolean; data: unknown } {
  return (
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    (result as { success: boolean }).success &&
    "data" in result
  )
}

function hasIdProperty(data: unknown): data is { id: unknown } {
  return typeof data === "object" && data !== null && "id" in data
}

function extractEntityId(result: unknown): string | undefined {
  if (!isSuccessResult(result)) {
    return undefined
  }

  if (!hasIdProperty(result.data)) {
    return undefined
  }

  const id = result.data.id
  return typeof id === "string" ? id : undefined
}

function extractErrorMessage(result: unknown): string | undefined {
  if (typeof result === "object" && result !== null && "error" in result) {
    return (result as { error: string }).error
  }
  return undefined
}

function getActionSuccess(result: unknown): boolean {
  if (typeof result === "object" && result !== null && "success" in result) {
    return (result as { success: boolean }).success
  }
  return true
}

async function buildRequestData(): Promise<AuditRequestData> {
  const headersList = await headers()
  const request = { headers: headersList }
  const geo = geolocation(request)

  return {
    ipAddress: ipAddress(request) || undefined,
    userAgent: headersList.get("user-agent") || undefined,
    referer: headersList.get("referer") || undefined,
    acceptLanguage: headersList.get("accept-language") || undefined,
    geoCity: geo.city || undefined,
    geoCountry: geo.country || undefined,
    geoCountryFlag: geo.flag || undefined,
    geoRegion: geo.countryRegion || undefined,
    geoEdgeRegion: geo.region || undefined,
    geoLatitude: geo.latitude || undefined,
    geoLongitude: geo.longitude || undefined,
    geoPostalCode: geo.postalCode || undefined,
  }
}

export async function withAudit<T>(
  options: WithAuditOptions,
  action: () => Promise<T>
): Promise<T> {
  const { action: actionName, payload, entityType } = options
  const requestData = await buildRequestData()
  const { userId } = await auth()

  const serializedPayload = serializePayload(payload)

  let success = true
  let errorMessage: string | undefined
  let entityId: string | undefined
  let result: T

  try {
    result = await action()
    success = getActionSuccess(result)
    if (!success) {
      errorMessage = extractErrorMessage(result)
    }
    if (entityType && success) {
      entityId = extractEntityId(result)
    }
  } catch (error) {
    success = false
    errorMessage = error instanceof Error ? error.message : String(error)
    throw error
  } finally {
    await logAuditEntry({
      ...requestData,
      userId: userId || undefined,
      action: actionName,
      payload: serializedPayload,
      success,
      errorMessage,
      entityType,
      entityId,
    })
  }

  return result
}

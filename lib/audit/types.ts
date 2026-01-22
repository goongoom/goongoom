export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type EntityType = "question" | "answer"

export interface AuditRequestData {
  ipAddress?: string
  geoCity?: string
  geoCountry?: string
  geoCountryFlag?: string
  geoRegion?: string
  geoEdgeRegion?: string
  geoLatitude?: string
  geoLongitude?: string
  geoPostalCode?: string
  userAgent?: string
  referer?: string
  acceptLanguage?: string
}

export interface AuditLogEntry extends AuditRequestData {
  userId?: string
  action: string
  payload?: JsonValue
  success: boolean
  errorMessage?: string
  entityType?: EntityType
  entityId?: string
}

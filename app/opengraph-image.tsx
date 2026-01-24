import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { cookies } from "next/headers"
import { ImageResponse } from "next/og"
import { getTranslations } from "next-intl/server"
import {
  DEFAULT_SIGNATURE_COLOR,
  SIGNATURE_COLORS,
} from "@/lib/colors/signature-colors"

export const runtime = "nodejs"
export const alt = "Goongoom"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const fontRegularPromise = readFile(
  join(process.cwd(), "public/fonts/Pretendard-Regular.otf")
)
const fontBoldPromise = readFile(
  join(process.cwd(), "public/fonts/Pretendard-Bold.otf")
)

const logoPromise = readFile(join(process.cwd(), "assets/logo.png"))

export default async function Image() {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get("theme")?.value
  const isDark = themeCookie === "dark"
  const colors = SIGNATURE_COLORS[DEFAULT_SIGNATURE_COLOR]
  const theme = isDark ? colors.dark : colors.light

  const [fontRegular, fontBold, logoData, t] = await Promise.all([
    fontRegularPromise,
    fontBoldPromise,
    logoPromise,
    getTranslations("og"),
  ])
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.bg,
        fontFamily: "Pretendard",
        color: isDark ? "#F9FAFB" : "#111827",
        gap: "40px",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: OG images require native img */}
      <img
        alt={t("logoAlt")}
        height={260}
        src={logoBase64}
        style={{ borderRadius: "52px" }}
        width={260}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div style={{ fontSize: "92px", fontWeight: 700 }}>{t("appName")}</div>
        <div
          style={{ fontSize: "42px", color: isDark ? "#9CA3AF" : "#6B7280" }}
        >
          {t("tagline")}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "40px",
          fontSize: "28px",
          color: isDark ? "#6B7280" : "#9CA3AF",
        }}
      >
        goongoom.com
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: fontRegular, weight: 400 },
        { name: "Pretendard", data: fontBold, weight: 700 },
      ],
    }
  )
}

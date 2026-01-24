import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { getSignatureColor } from "@/lib/colors/signature-colors"

const clamp = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value

const pickText = (value: string | null, fallback: string, max: number) => {
  const trimmed = (value || "").trim()
  if (!trimmed) {
    return fallback
  }
  return clamp(trimmed, max)
}

function getDicebearUrl(
  seed: string,
  gradientColors: readonly [string, string]
) {
  const color1 = gradientColors[0].replace("#", "")
  const color2 = gradientColors[1].replace("#", "")
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${color1},${color2}&backgroundType=gradientLinear`
}

async function fetchImageAsBase64(
  url: string,
  gradientColors: readonly [string, string]
): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const contentType = response.headers.get("content-type") || "image/png"
    return `data:${contentType};base64,${base64}`
  } catch {
    return getDicebearUrl("fallback", gradientColors)
  }
}

const fontRegularPromise = readFile(
  join(process.cwd(), "public/fonts/Pretendard-Regular.otf")
)
const fontSemiBoldPromise = readFile(
  join(process.cwd(), "public/fonts/Pretendard-SemiBold.otf")
)
const fontBoldPromise = readFile(
  join(process.cwd(), "public/fonts/Pretendard-Bold.otf")
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const question = pickText(
    searchParams.get("question"),
    "궁금한 질문이 여기에 표시돼요.",
    180
  )
  const answer = pickText(
    searchParams.get("answer"),
    "재치있는 답변을 공유해 보세요.",
    260
  )
  const name = pickText(searchParams.get("name"), "사용자", 40)
  const colorKey = searchParams.get("color")
  const isDark = searchParams.get("dark") === "1"
  const colors = getSignatureColor(colorKey)
  const theme = isDark ? colors.dark : colors.light

  const askerAvatarSrc =
    searchParams.get("askerAvatar") ||
    getDicebearUrl("anonymous", colors.gradient)
  const answererAvatarSrc =
    searchParams.get("answererAvatar") || getDicebearUrl(name, colors.gradient)

  const [
    fontRegular,
    fontSemiBold,
    fontBold,
    askerAvatarUrl,
    answererAvatarUrl,
  ] = await Promise.all([
    fontRegularPromise,
    fontSemiBoldPromise,
    fontBoldPromise,
    fetchImageAsBase64(askerAvatarSrc, colors.gradient),
    fetchImageAsBase64(answererAvatarSrc, colors.gradient),
  ])

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        backgroundColor: theme.bg,
        fontFamily: "Pretendard",
        color: isDark ? "#F9FAFB" : "#111827",
        wordWrap: "break-word",
        wordBreak: "keep-all",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: "20px" }}>
          {/* biome-ignore lint/performance/noImgElement: OG images require native img */}
          <img
            alt="Asker"
            height={80}
            src={askerAvatarUrl}
            style={{ borderRadius: "40px", flexShrink: 0 }}
            width={80}
          />
          <div
            style={{
              display: "flex",
              maxWidth: "85%",
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
              borderRadius: "48px",
              padding: "48px 56px",
              fontSize: "56px",
              fontWeight: 600,
              lineHeight: 1.4,
              boxShadow: isDark
                ? "0 4px 24px rgba(0, 0, 0, 0.3)"
                : "0 4px 24px rgba(0, 0, 0, 0.06)",
            }}
          >
            {question}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              maxWidth: "85%",
              background: `linear-gradient(135deg, ${colors.gradient[0]} 0%, ${colors.gradient[1]} 100%)`,
              borderRadius: "48px",
              padding: "48px 56px",
              fontSize: "56px",
              fontWeight: 600,
              lineHeight: 1.4,
              color: "#FFFFFF",
            }}
          >
            {answer}
          </div>
          {/* biome-ignore lint/performance/noImgElement: OG images require native img */}
          <img
            alt={name}
            height={80}
            src={answererAvatarUrl}
            style={{ borderRadius: "40px", flexShrink: 0 }}
            width={80}
          />
        </div>
      </div>
    </div>,
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: "Pretendard", data: fontRegular, weight: 400 },
        { name: "Pretendard", data: fontSemiBold, weight: 600 },
        { name: "Pretendard", data: fontBold, weight: 700 },
      ],
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  )
}

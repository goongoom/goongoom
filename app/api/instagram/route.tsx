import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

const clamp = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value

const pickText = (value: string | null, fallback: string, max: number) => {
  const trimmed = (value || "").trim()
  if (!trimmed) {
    return fallback
  }
  return clamp(trimmed, max)
}

function getDicebearUrl(seed: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=10b981,059669,047857,34d399,6ee7b7&backgroundType=gradientLinear`
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
const logoPromise = readFile(join(process.cwd(), "assets/logo.png"))

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

  const askerAvatarUrl =
    searchParams.get("askerAvatar") || getDicebearUrl("anonymous")
  const answererAvatarUrl =
    searchParams.get("answererAvatar") || getDicebearUrl(name)

  const [fontRegular, fontSemiBold, fontBold, logoData] = await Promise.all([
    fontRegularPromise,
    fontSemiBoldPromise,
    fontBoldPromise,
    logoPromise,
  ])
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "80px",
        backgroundColor: "#ecfdf5",
        fontFamily: "Pretendard",
        color: "#111827",
        wordWrap: "break-word",
        wordBreak: "keep-all",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* biome-ignore lint/performance/noImgElement: OG images require native img */}
          <img
            alt="궁금닷컴"
            height={80}
            src={logoBase64}
            style={{ borderRadius: "20px" }}
            width={80}
          />
          <div style={{ fontSize: "56px", fontWeight: 700 }}>궁금닷컴</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* biome-ignore lint/performance/noImgElement: OG images require native img */}
          <img
            alt={name}
            height={64}
            src={answererAvatarUrl}
            style={{ borderRadius: "32px" }}
            width={64}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <div style={{ fontSize: "36px", fontWeight: 600 }}>
              {clamp(name, 12)}
            </div>
            <div style={{ fontSize: "28px", color: "#9CA3AF" }}>
              goongoom.com
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "48px",
          marginTop: "40px",
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
              backgroundColor: "#FFFFFF",
              borderRadius: "48px",
              padding: "48px 56px",
              fontSize: "56px",
              fontWeight: 600,
              lineHeight: 1.4,
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
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
              background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          color: "#9CA3AF",
          marginTop: "auto",
        }}
      >
        무엇이든 물어보세요
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

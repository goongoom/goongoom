import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const runtime = "nodejs"
export const alt = "궁금닷컴 - 무엇이든 물어보세요"
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
  const [fontRegular, fontBold, logoData] = await Promise.all([
    fontRegularPromise,
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
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF7ED",
        fontFamily: "Pretendard",
        color: "#111827",
        gap: "40px",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: OG images require native img */}
      <img
        alt="궁금닷컴 로고"
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
        <div style={{ fontSize: "92px", fontWeight: 700 }}>궁금닷컴</div>
        <div style={{ fontSize: "42px", color: "#6B7280" }}>
          무엇이든 물어보세요
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "40px",
          fontSize: "28px",
          color: "#9CA3AF",
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

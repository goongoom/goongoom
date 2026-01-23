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

const fontPromise = readFile(
  join(process.cwd(), "public/fonts/PretendardVariable.ttf")
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

  const fontData = await fontPromise

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "80px",
        backgroundColor: "#FFF7ED",
        fontFamily: "Pretendard Variable",
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
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "24px",
              backgroundColor: "#F97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "48px",
              fontWeight: 700,
            }}
          >
            궁
          </div>
          <div style={{ fontSize: "64px", fontWeight: 700 }}>궁금닷컴</div>
        </div>
        <div
          style={{
            padding: "20px 36px",
            borderRadius: "999px",
            backgroundColor: "#FFEDD5",
            color: "#9A3412",
            fontSize: "40px",
            fontWeight: 600,
          }}
        >
          Instagram 공유
        </div>
      </div>

      <div
        style={{
          marginTop: "120px",
          display: "flex",
          flexDirection: "column",
          gap: "56px",
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "56px",
            padding: "60px 68px",
            fontSize: "72px",
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          {question}
        </div>
        <div
          style={{
            alignSelf: "flex-end",
            backgroundColor: "#F97316",
            borderRadius: "56px",
            padding: "60px 68px",
            fontSize: "72px",
            fontWeight: 600,
            lineHeight: 1.4,
            color: "#FFFFFF",
          }}
        >
          {answer}
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "44px",
          color: "#6B7280",
        }}
      >
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div>goongoom.com</div>
      </div>
    </div>,
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: "Pretendard Variable", data: fontData, weight: 400 },
        { name: "Pretendard Variable", data: fontData, weight: 600 },
        { name: "Pretendard Variable", data: fontData, weight: 700 },
      ],
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  )
}

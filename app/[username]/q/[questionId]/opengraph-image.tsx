import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { getClerkUserByUsername } from "@/lib/clerk"
import { getQuestionByIdAndRecipient } from "@/lib/db/queries"
import type { QuestionId } from "@/lib/types"

export const runtime = "nodejs"
export const alt = "Question & Answer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const fontPromise = readFile(
  join(process.cwd(), "public/fonts/PretendardVariable.ttf")
)

const clamp = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value

interface PageProps {
  params: Promise<{ username: string; questionId: string }>
}

export default async function Image({ params }: PageProps) {
  const { username, questionId: questionIdParam } = await params
  const questionId = questionIdParam as QuestionId
  const fontData = await fontPromise

  const clerkUser = await getClerkUserByUsername(username)
  if (!clerkUser) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFF7ED",
          fontFamily: "Pretendard Variable",
          fontSize: 48,
          color: "#6B7280",
        }}
      >
        User not found
      </div>,
      {
        ...size,
        fonts: [{ name: "Pretendard Variable", data: fontData, weight: 400 }],
      }
    )
  }

  const qa = await getQuestionByIdAndRecipient(questionId, clerkUser.clerkId)
  if (!qa?.answer) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFF7ED",
          fontFamily: "Pretendard Variable",
          fontSize: 48,
          color: "#6B7280",
        }}
      >
        Question not found
      </div>,
      {
        ...size,
        fonts: [{ name: "Pretendard Variable", data: fontData, weight: 400 }],
      }
    )
  }

  const displayName = clerkUser.displayName || clerkUser.username || username
  const question = clamp(qa.content, 100)
  const answer = clamp(qa.answer.content, 120)

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "48px",
        backgroundColor: "#FFF7ED",
        fontFamily: "Pretendard Variable",
        color: "#111827",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#F97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            궁
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700 }}>궁금닷컴</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {clerkUser.avatarUrl ? (
            // biome-ignore lint/performance/noImgElement: OG images require native img
            <img
              alt=""
              height={44}
              src={clerkUser.avatarUrl}
              style={{ borderRadius: "22px" }}
              width={44}
            />
          ) : (
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "22px",
                backgroundColor: "#FFEDD5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 700,
                color: "#F97316",
              }}
            >
              {displayName[0] || "?"}
            </div>
          )}
          <div style={{ fontSize: "24px", fontWeight: 600 }}>
            {clamp(displayName, 20)}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "24px",
          marginTop: "24px",
        }}
      >
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "85%",
            backgroundColor: "#FFFFFF",
            borderRadius: "28px",
            padding: "28px 36px",
            fontSize: "36px",
            fontWeight: 600,
            lineHeight: 1.4,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          {question}
        </div>
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: "85%",
            background: "linear-gradient(135deg, #A855F7 0%, #EC4899 100%)",
            borderRadius: "28px",
            padding: "28px 36px",
            fontSize: "36px",
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "20px",
          color: "#9CA3AF",
        }}
      >
        <div>무엇이든 물어보세요</div>
        <div>goongoom.com/{clamp(clerkUser.username || username, 20)}</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Pretendard Variable", data: fontData, weight: 400 },
        { name: "Pretendard Variable", data: fontData, weight: 600 },
        { name: "Pretendard Variable", data: fontData, weight: 700 },
      ],
    }
  )
}

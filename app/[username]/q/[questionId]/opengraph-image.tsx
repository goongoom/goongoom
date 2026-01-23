import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { getClerkUserById, getClerkUserByUsername } from "@/lib/clerk"
import { getQuestionByIdAndRecipient } from "@/lib/db/queries"
import type { QuestionId } from "@/lib/types"

function getDicebearUrl(seed: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=10b981,059669,047857,34d399,6ee7b7&backgroundType=gradientLinear`
}

export const runtime = "nodejs"
export const alt = "Question & Answer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

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

const clamp = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value

interface PageProps {
  params: Promise<{ username: string; questionId: string }>
}

export default async function Image({ params }: PageProps) {
  const { username, questionId: questionIdParam } = await params
  const questionId = questionIdParam as QuestionId
  const [fontRegular, fontSemiBold, fontBold, logoData] = await Promise.all([
    fontRegularPromise,
    fontSemiBoldPromise,
    fontBoldPromise,
    logoPromise,
  ])
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`

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
          backgroundColor: "#ecfdf5",
          fontFamily: "Pretendard",
          fontSize: 48,
          color: "#6B7280",
        }}
      >
        User not found
      </div>,
      {
        ...size,
        fonts: [{ name: "Pretendard", data: fontRegular, weight: 400 }],
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
          backgroundColor: "#ecfdf5",
          fontFamily: "Pretendard",
          fontSize: 48,
          color: "#6B7280",
        }}
      >
        Question not found
      </div>,
      {
        ...size,
        fonts: [{ name: "Pretendard", data: fontRegular, weight: 400 }],
      }
    )
  }

  const displayName = clerkUser.displayName || clerkUser.username || username
  const question = clamp(qa.content, 80)
  const answer = clamp(qa.answer.content, 100)

  let askerAvatarUrl: string
  if (qa.isAnonymous) {
    askerAvatarUrl = getDicebearUrl(qa.anonymousAvatarSeed || qa._id)
  } else if (qa.senderClerkId) {
    const sender = await getClerkUserById(qa.senderClerkId)
    askerAvatarUrl = sender?.avatarUrl || getDicebearUrl(qa.senderClerkId)
  } else {
    askerAvatarUrl = getDicebearUrl(qa._id)
  }

  const answererAvatarUrl =
    clerkUser.avatarUrl || getDicebearUrl(clerkUser.clerkId)

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "56px",
        backgroundColor: "#ecfdf5",
        fontFamily: "Pretendard",
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* biome-ignore lint/performance/noImgElement: OG images require native img */}
          <img
            alt="궁금닷컴"
            height={64}
            src={logoBase64}
            style={{ borderRadius: "18px" }}
            width={64}
          />
          <div style={{ display: "flex", fontSize: "36px", fontWeight: 700 }}>
            궁금닷컴
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {clerkUser.avatarUrl ? (
            // biome-ignore lint/performance/noImgElement: OG images require native img
            <img
              alt={displayName}
              height={56}
              src={clerkUser.avatarUrl}
              style={{ borderRadius: "28px" }}
              width={56}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "28px",
                backgroundColor: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 700,
                color: "#10b981",
              }}
            >
              {displayName[0] || "?"}
            </div>
          )}
          <div style={{ display: "flex", fontSize: "30px", fontWeight: 600 }}>
            {clamp(displayName, 16)}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "28px",
          marginTop: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: "14px" }}>
          {/* biome-ignore lint/performance/noImgElement: OG images require native img */}
          <img
            alt="Asker"
            height={60}
            src={askerAvatarUrl}
            style={{ borderRadius: "30px" }}
            width={60}
          />
          <div
            style={{
              display: "flex",
              maxWidth: "80%",
              backgroundColor: "#FFFFFF",
              borderRadius: "32px",
              padding: "32px 40px",
              fontSize: "40px",
              fontWeight: 600,
              lineHeight: 1.4,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
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
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              maxWidth: "80%",
              background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              borderRadius: "32px",
              padding: "32px 40px",
              fontSize: "40px",
              fontWeight: 600,
              lineHeight: 1.4,
              color: "#FFFFFF",
            }}
          >
            {answer}
          </div>
          {/* biome-ignore lint/performance/noImgElement: OG images require native img */}
          <img
            alt={displayName}
            height={60}
            src={answererAvatarUrl}
            style={{ borderRadius: "30px" }}
            width={60}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "24px",
          color: "#9CA3AF",
        }}
      >
        <div style={{ display: "flex" }}>무엇이든 물어보세요</div>
        <div style={{ display: "flex" }}>
          goongoom.com/{clamp(clerkUser.username || username, 16)}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: fontRegular, weight: 400 },
        { name: "Pretendard", data: fontSemiBold, weight: 600 },
        { name: "Pretendard", data: fontBold, weight: 700 },
      ],
    }
  )
}

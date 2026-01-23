import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { getClerkUserByUsername } from "@/lib/clerk"
import { getOrCreateUser } from "@/lib/db/queries"

export const runtime = "nodejs"
export const alt = "User Profile"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const fontRegularPromise = readFile(
  join(process.cwd(), "public/fonts/Pretendard-Regular.ttf")
)
const fontBoldPromise = readFile(
  join(process.cwd(), "public/fonts/Pretendard-Bold.ttf")
)

const clamp = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function Image({ params }: PageProps) {
  const { username } = await params
  const [fontRegular, fontBold] = await Promise.all([
    fontRegularPromise,
    fontBoldPromise,
  ])

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

  const dbUser = await getOrCreateUser(clerkUser.clerkId)
  const displayName = clerkUser.displayName || clerkUser.username || username
  const bio = dbUser?.bio ? clamp(dbUser.bio, 120) : null

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "60px",
        backgroundColor: "#FFF7ED",
        fontFamily: "Pretendard",
        color: "#111827",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            backgroundColor: "#F97316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          궁
        </div>
        <div style={{ fontSize: "32px", fontWeight: 700 }}>궁금닷컴</div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "48px",
          marginTop: "40px",
        }}
      >
        {clerkUser.avatarUrl ? (
          // biome-ignore lint/performance/noImgElement: OG images require native img
          <img
            alt={displayName}
            height={180}
            src={clerkUser.avatarUrl}
            style={{
              borderRadius: "90px",
              border: "4px solid rgba(249, 115, 22, 0.3)",
            }}
            width={180}
          />
        ) : (
          <div
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "90px",
              backgroundColor: "#FFEDD5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "72px",
              fontWeight: 700,
              color: "#F97316",
            }}
          >
            {displayName[0] || "?"}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            flex: 1,
          }}
        >
          <div style={{ fontSize: "56px", fontWeight: 700, lineHeight: 1.2 }}>
            {clamp(displayName, 24)}
          </div>
          <div style={{ fontSize: "32px", color: "#6B7280" }}>
            @{clamp(clerkUser.username || username, 30)}
          </div>
          {bio && (
            <div
              style={{
                fontSize: "28px",
                color: "#374151",
                marginTop: "8px",
                lineHeight: 1.4,
              }}
            >
              {bio}
            </div>
          )}
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
        <div>무엇이든 물어보세요</div>
        <div>goongoom.com/{clamp(clerkUser.username || username, 20)}</div>
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

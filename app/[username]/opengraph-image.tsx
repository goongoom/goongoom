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
  join(process.cwd(), "public/fonts/Pretendard-Regular.otf")
)
const fontBoldPromise = readFile(
  join(process.cwd(), "public/fonts/Pretendard-Bold.otf")
)
const logoPromise = readFile(join(process.cwd(), "assets/logo.png"))

const clamp = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function Image({ params }: PageProps) {
  const { username } = await params
  const [fontRegular, fontBold, logoData] = await Promise.all([
    fontRegularPromise,
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
        padding: "72px",
        backgroundColor: "#ecfdf5",
        fontFamily: "Pretendard",
        color: "#111827",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: OG images require native img */}
        <img
          alt="궁금닷컴"
          height={72}
          src={logoBase64}
          style={{ borderRadius: "20px" }}
          width={72}
        />
        <div style={{ display: "flex", fontSize: "40px", fontWeight: 700 }}>
          궁금닷컴
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "56px",
          marginTop: "32px",
        }}
      >
        {clerkUser.avatarUrl ? (
          // biome-ignore lint/performance/noImgElement: OG images require native img
          <img
            alt={displayName}
            height={220}
            src={clerkUser.avatarUrl}
            style={{
              borderRadius: "110px",
              border: "6px solid rgba(16, 185, 129, 0.3)",
            }}
            width={220}
          />
        ) : (
          <div
            style={{
              width: "220px",
              height: "220px",
              borderRadius: "110px",
              backgroundColor: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "88px",
              fontWeight: 700,
              color: "#10b981",
            }}
          >
            {displayName[0] || "?"}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
          }}
        >
          <div style={{ fontSize: "68px", fontWeight: 700, lineHeight: 1.2 }}>
            {clamp(displayName, 20)}
          </div>
          <div style={{ fontSize: "40px", color: "#6B7280" }}>
            @{clamp(clerkUser.username || username, 24)}
          </div>
          {bio && (
            <div
              style={{
                fontSize: "34px",
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
          fontSize: "28px",
          color: "#9CA3AF",
        }}
      >
        <div>무엇이든 물어보세요</div>
        <div>goongoom.com/{clamp(clerkUser.username || username, 16)}</div>
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

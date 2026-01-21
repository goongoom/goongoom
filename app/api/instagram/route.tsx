import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const clamp = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

const pickText = (value: string | null, fallback: string, max: number) => {
  const trimmed = (value || "").trim();
  if (!trimmed) return fallback;
  return clamp(trimmed, max);
};

const fontDir = join(process.cwd(), "public/fonts");
const fontsPromise = Promise.all([
  readFile(join(fontDir, "Pretendard-Regular.ttf")),
  readFile(join(fontDir, "Pretendard-SemiBold.ttf")),
  readFile(join(fontDir, "Pretendard-Bold.ttf")),
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const question = pickText(
    searchParams.get("question"),
    "궁금한 질문이 여기에 표시됩니다.",
    180,
  );
  const answer = pickText(
    searchParams.get("answer"),
    "재치있는 답변을 공유해보세요.",
    260,
  );
  const name = pickText(searchParams.get("name"), "사용자", 40);

  const [regular, semibold, bold] = await fontsPromise;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "160px",
          backgroundColor: "#FFF7ED",
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
          <div style={{ display: "flex", alignItems: "center", gap: "48px" }}>
            <div
              style={{
                width: "176px",
                height: "176px",
                borderRadius: "48px",
                backgroundColor: "#F97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "96px",
                fontWeight: 700,
              }}
            >
              궁
            </div>
            <div style={{ fontSize: "128px", fontWeight: 700 }}>궁금닷컴</div>
          </div>
          <div
            style={{
              padding: "40px 72px",
              borderRadius: "999px",
              backgroundColor: "#FFEDD5",
              color: "#9A3412",
              fontSize: "80px",
              fontWeight: 600,
            }}
          >
            Instagram 공유
          </div>
        </div>

        <div
          style={{
            marginTop: "240px",
            display: "flex",
            flexDirection: "column",
            gap: "112px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "112px",
              padding: "120px 136px",
              fontSize: "144px",
              fontWeight: 600,
              lineHeight: 1.4,
              boxShadow: "0 80px 160px rgba(249, 115, 22, 0.12)",
            }}
          >
            {question}
          </div>
          <div
            style={{
              alignSelf: "flex-end",
              backgroundColor: "#F97316",
              borderRadius: "112px",
              padding: "120px 136px",
              fontSize: "144px",
              fontWeight: 600,
              lineHeight: 1.4,
              color: "#FFFFFF",
              boxShadow: "0 96px 192px rgba(249, 115, 22, 0.28)",
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
            fontSize: "88px",
            color: "#6B7280",
          }}
        >
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div>goongoom.com</div>
        </div>
      </div>
    ),
    {
      width: 2160,
      height: 3840,
      fonts: [
        { name: "Pretendard", data: regular, weight: 400 },
        { name: "Pretendard", data: semibold, weight: 600 },
        { name: "Pretendard", data: bold, weight: 700 },
      ],
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}

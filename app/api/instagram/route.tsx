import { ImageResponse } from "next/og";

export const runtime = "edge";

const regularFont = fetch(
  new URL("../../../public/fonts/Pretendard-Regular.woff2", import.meta.url),
).then((res) => res.arrayBuffer());

const semiboldFont = fetch(
  new URL("../../../public/fonts/Pretendard-SemiBold.woff2", import.meta.url),
).then((res) => res.arrayBuffer());

const boldFont = fetch(
  new URL("../../../public/fonts/Pretendard-Bold.woff2", import.meta.url),
).then((res) => res.arrayBuffer());

const clamp = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

const pickText = (value: string | null, fallback: string, max: number) => {
  const trimmed = (value || "").trim();
  if (!trimmed) return fallback;
  return clamp(trimmed, max);
};

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

  const [regular, semibold, bold] = await Promise.all([
    regularFont,
    semiboldFont,
    boldFont,
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          backgroundColor: "#FFF7ED",
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
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
            <div style={{ fontSize: "32px", fontWeight: 700 }}>궁금닷컴</div>
          </div>
          <div
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              backgroundColor: "#FFEDD5",
              color: "#9A3412",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            Instagram 공유
          </div>
        </div>

        <div
          style={{
            marginTop: "60px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "28px",
              padding: "30px 34px",
              fontSize: "36px",
              fontWeight: 600,
              lineHeight: 1.4,
              boxShadow: "0 20px 40px rgba(249, 115, 22, 0.12)",
            }}
          >
            {question}
          </div>
          <div
            style={{
              alignSelf: "flex-end",
              backgroundColor: "#F97316",
              borderRadius: "28px",
              padding: "30px 34px",
              fontSize: "36px",
              fontWeight: 600,
              lineHeight: 1.4,
              color: "#FFFFFF",
              boxShadow: "0 24px 48px rgba(249, 115, 22, 0.28)",
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
            fontSize: "22px",
            color: "#6B7280",
          }}
        >
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div>goongoom.com</div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [
        { name: "Pretendard", data: regular, weight: 400 },
        { name: "Pretendard", data: semibold, weight: 600 },
        { name: "Pretendard", data: bold, weight: 700 },
      ],
    },
  );
}

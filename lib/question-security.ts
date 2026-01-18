export const QUESTION_SECURITY_LEVELS = [
  "anyone",
  "verified_anonymous",
  "public_only",
] as const;

export type QuestionSecurityLevel = (typeof QUESTION_SECURITY_LEVELS)[number];

export const DEFAULT_QUESTION_SECURITY_LEVEL: QuestionSecurityLevel = "anyone";

export const QUESTION_SECURITY_OPTIONS: Record<
  QuestionSecurityLevel,
  { label: string; description: string }
> = {
  anyone: {
    label: "누구나 질문 가능",
    description: "비회원도 익명 질문을 보낼 수 있습니다.",
  },
  verified_anonymous: {
    label: "익명은 로그인 사용자만",
    description:
      "익명 질문은 로그인 사용자만 보낼 수 있고, 사법 기관 요청이 없는 한 이름은 공개되지 않습니다.",
  },
  public_only: {
    label: "공개 질문만",
    description: "공개 질문만 받습니다.",
  },
};

export function isQuestionSecurityLevel(
  value: string,
): value is QuestionSecurityLevel {
  return (QUESTION_SECURITY_LEVELS as readonly string[]).includes(value);
}

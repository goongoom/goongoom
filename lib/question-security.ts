import { getTranslations } from "next-intl/server"

export const QUESTION_SECURITY_LEVELS = [
  "anyone",
  "verified_anonymous",
  "public_only",
] as const

export type QuestionSecurityLevel = (typeof QUESTION_SECURITY_LEVELS)[number]

export const DEFAULT_QUESTION_SECURITY_LEVEL: QuestionSecurityLevel = "anyone"

export async function getQuestionSecurityOptions(): Promise<
  Record<QuestionSecurityLevel, { label: string; description: string }>
> {
  const t = await getTranslations("questionSecurity")
  return {
    anyone: {
      label: t("anyoneLabel"),
      description: t("anyoneDescription"),
    },
    verified_anonymous: {
      label: t("verifiedLabel"),
      description: t("verifiedDescription"),
    },
    public_only: {
      label: t("identifiedOnlyLabel"),
      description: t("identifiedOnlyDescription"),
    },
  }
}

export function isQuestionSecurityLevel(
  value: string
): value is QuestionSecurityLevel {
  return (QUESTION_SECURITY_LEVELS as readonly string[]).includes(value)
}

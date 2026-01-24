"use server"

import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"
import { withAudit } from "@/lib/audit/with-audit"
import { getClerkUserById } from "@/lib/clerk"
import { getOrCreateUser, updateUserProfile } from "@/lib/db/queries"
import {
  DEFAULT_QUESTION_SECURITY_LEVEL,
  isQuestionSecurityLevel,
} from "@/lib/question-security"
import type { SocialLinks, UserProfile } from "@/lib/types"
import {
  fetchNaverBlogTitle,
  normalizeNaverBlogHandle,
} from "@/lib/utils/social-links"

export type ProfileActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getProfile(): Promise<ProfileActionResult<UserProfile>> {
  const t = await getTranslations("errors")
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return { success: false, error: t("loginRequired") }
    }

    const clerkUser = await getClerkUserById(clerkId)
    if (!clerkUser) {
      return { success: false, error: t("userNotFound") }
    }

    const dbUser = await getOrCreateUser(clerkId)

    const securityLevel = dbUser?.questionSecurityLevel ?? ""
    const validSecurityLevel = isQuestionSecurityLevel(securityLevel)
      ? securityLevel
      : DEFAULT_QUESTION_SECURITY_LEVEL

    return {
      success: true,
      data: {
        clerkId: clerkUser.clerkId,
        username: clerkUser.username,
        displayName: clerkUser.displayName,
        avatarUrl: clerkUser.avatarUrl,
        bio: dbUser?.bio || null,
        socialLinks: dbUser?.socialLinks || null,
        questionSecurityLevel: validSecurityLevel,
      },
    }
  } catch (error) {
    console.error("Profile fetch error:", error)
    return {
      success: false,
      error: t("profileLoadError"),
    }
  }
}

export async function updateProfile(data: {
  bio?: string | null
  socialLinks?: SocialLinks | null
  questionSecurityLevel?: string | null
  signatureColor?: string | null
}): Promise<ProfileActionResult<UserProfile>> {
  return await withAudit(
    { action: "updateProfile", payload: data },
    async () => {
      const t = await getTranslations("errors")
      try {
        const { userId: clerkId } = await auth()

        if (!clerkId) {
          return { success: false, error: t("loginRequired") }
        }

        await getOrCreateUser(clerkId)

        if (
          data.questionSecurityLevel &&
          !isQuestionSecurityLevel(data.questionSecurityLevel)
        ) {
          return { success: false, error: t("invalidSecuritySetting") }
        }

        const validatedSecurityLevel =
          data.questionSecurityLevel &&
          isQuestionSecurityLevel(data.questionSecurityLevel)
            ? data.questionSecurityLevel
            : undefined

        const updated = await updateUserProfile(clerkId, {
          bio: data.bio,
          socialLinks: data.socialLinks,
          questionSecurityLevel: validatedSecurityLevel,
          signatureColor: data.signatureColor,
        })

        const clerkUser = await getClerkUserById(clerkId)

        const updatedSecurityLevel = updated[0]?.questionSecurityLevel ?? ""
        const finalSecurityLevel = isQuestionSecurityLevel(updatedSecurityLevel)
          ? updatedSecurityLevel
          : DEFAULT_QUESTION_SECURITY_LEVEL

        return {
          success: true,
          data: {
            clerkId,
            username: clerkUser?.username || null,
            displayName: clerkUser?.displayName || null,
            avatarUrl: clerkUser?.avatarUrl || null,
            bio: updated[0]?.bio || null,
            socialLinks: updated[0]?.socialLinks || null,
            questionSecurityLevel: finalSecurityLevel,
          },
        }
      } catch (error) {
        console.error("Profile update error:", error)
        return { success: false, error: t("profileUpdateError") }
      }
    }
  )
}

export async function fetchNaverBlogTitleAction(
  handle: string
): Promise<ProfileActionResult<string>> {
  const t = await getTranslations("errors")
  try {
    const normalizedHandle = normalizeNaverBlogHandle(handle)
    if (!normalizedHandle) {
      return { success: false, error: t("invalidInput") }
    }
    const title = await fetchNaverBlogTitle(normalizedHandle)
    return { success: true, data: title }
  } catch (error) {
    console.error("Naver Blog title fetch error:", error)
    return { success: false, error: t("genericError") }
  }
}

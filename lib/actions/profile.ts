"use server"

import { auth } from "@clerk/nextjs/server"
import { getTranslations } from "next-intl/server"
import { getClerkUserById } from "@/lib/clerk"
import { getOrCreateUser, updateUserProfile } from "@/lib/db/queries"
import {
  DEFAULT_QUESTION_SECURITY_LEVEL,
  isQuestionSecurityLevel,
} from "@/lib/question-security"
import type { UserProfile } from "@/lib/types"
import type { SocialLinks } from "@/src/db/schema"

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

    return {
      success: true,
      data: {
        clerkId: clerkUser.clerkId,
        username: clerkUser.username,
        displayName: clerkUser.displayName,
        avatarUrl: clerkUser.avatarUrl,
        bio: dbUser?.bio || null,
        socialLinks: dbUser?.socialLinks || null,
        questionSecurityLevel:
          dbUser?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL,
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
}): Promise<ProfileActionResult<UserProfile>> {
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
    })

    const clerkUser = await getClerkUserById(clerkId)

    return {
      success: true,
      data: {
        clerkId,
        username: clerkUser?.username || null,
        displayName: clerkUser?.displayName || null,
        avatarUrl: clerkUser?.avatarUrl || null,
        bio: updated[0]?.bio || null,
        socialLinks: updated[0]?.socialLinks || null,
        questionSecurityLevel:
          updated[0]?.questionSecurityLevel || DEFAULT_QUESTION_SECURITY_LEVEL,
      },
    }
  } catch (error) {
    console.error("Profile update error:", error)
    return { success: false, error: t("profileUpdateError") }
  }
}

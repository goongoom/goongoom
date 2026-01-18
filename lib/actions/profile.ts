'use server'

import { auth } from '@clerk/nextjs/server'
import { getClerkUserById } from '@/lib/clerk'
import { updateUserProfile, getOrCreateUser } from '@/lib/db/queries'
import type { SocialLinks } from '@/src/db/schema'
import type { UserProfile } from '@/lib/types'

export type ProfileActionResult<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: string }

export async function getProfile(): Promise<ProfileActionResult<UserProfile>> {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return { success: false, error: '로그인이 필요합니다' }
    }
    
    const clerkUser = await getClerkUserById(clerkId)
    if (!clerkUser) {
      return { success: false, error: '사용자를 찾을 수 없습니다' }
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
      },
    }
  } catch (error) {
    console.error('Profile fetch error:', error)
    return { success: false, error: '프로필 정보를 불러오는 중 오류가 발생했습니다' }
  }
}

export async function updateProfile(data: {
  bio?: string | null
  socialLinks?: SocialLinks | null
}): Promise<ProfileActionResult<UserProfile>> {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return { success: false, error: '로그인이 필요합니다' }
    }
    
    await getOrCreateUser(clerkId)
    
    const updated = await updateUserProfile(clerkId, {
      bio: data.bio,
      socialLinks: data.socialLinks,
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
      },
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return { success: false, error: '프로필 수정 중 오류가 발생했습니다' }
  }
}

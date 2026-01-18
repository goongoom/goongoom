import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getClerkUserById } from '@/lib/clerk'
import { updateUserProfile, getOrCreateUser } from '@/lib/db/queries'
import type { SocialLinks } from '@/src/db/schema'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }
    
    const clerkUser = await getClerkUserById(clerkId)
    if (!clerkUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    const dbUser = await getOrCreateUser(clerkId)
    
    return NextResponse.json({
      clerkId: clerkUser.clerkId,
      username: clerkUser.username,
      displayName: clerkUser.displayName,
      avatarUrl: clerkUser.avatarUrl,
      bio: dbUser?.bio || null,
      socialLinks: dbUser?.socialLinks || null,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: '프로필 정보를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }
    
    const [, body] = await Promise.all([
      getOrCreateUser(clerkId),
      request.json(),
    ])
    const { bio, socialLinks } = body as {
      bio?: string | null
      socialLinks?: SocialLinks | null
    }
    
    const updated = await updateUserProfile(clerkId, {
      bio,
      socialLinks,
    })
    
    const clerkUser = await getClerkUserById(clerkId)
    
    return NextResponse.json({
      clerkId,
      username: clerkUser?.username || null,
      displayName: clerkUser?.displayName || null,
      avatarUrl: clerkUser?.avatarUrl || null,
      bio: updated[0]?.bio || null,
      socialLinks: updated[0]?.socialLinks || null,
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: '프로필 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

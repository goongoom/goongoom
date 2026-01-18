import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getClerkUserByUsername } from '@/lib/clerk'
import { getUserByClerkId, getAnsweredQuestionsForUser } from '@/lib/db/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    
    const clerkUser = await getClerkUserByUsername(username)
    if (!clerkUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    const dbUser = await getUserByClerkId(clerkUser.clerkId)
    const questionsWithAnswers = await getAnsweredQuestionsForUser(clerkUser.clerkId)
    
    return NextResponse.json({
      user: {
        clerkId: clerkUser.clerkId,
        username: clerkUser.username,
        displayName: clerkUser.displayName,
        avatarUrl: clerkUser.avatarUrl,
        bio: dbUser?.bio || null,
        socialLinks: dbUser?.socialLinks || null,
      },
      questionsWithAnswers,
    })
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: '사용자 정보를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

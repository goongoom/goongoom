import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cookies } from 'next/headers'
import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { getUserLocale } from '@/i18n/get-user-locale'
import { getSignatureColor } from '@/lib/colors/signature-colors'
import type { QuestionId } from '@/lib/types'

function getDicebearUrl(seed: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&flip=true`
}

async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const contentType = response.headers.get('content-type') || 'image/png'
    return `data:${contentType};base64,${base64}`
  } catch {
    return getDicebearUrl('fallback')
  }
}

export const runtime = 'nodejs'
export const alt = 'Question & Answer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const fontRegularPromise = readFile(join(process.cwd(), 'assets/fonts/LINESeedKR-Rg.otf'))
const fontBoldPromise = readFile(join(process.cwd(), 'assets/fonts/LINESeedKR-Bd.otf'))
const fontJpRegularPromise = readFile(join(process.cwd(), 'assets/fonts/LINESeedJP_OTF_Rg.otf'))
const fontJpBoldPromise = readFile(join(process.cwd(), 'assets/fonts/LINESeedJP_OTF_Bd.otf'))

const clamp = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value)

interface PageProps {
  params: Promise<{ username: string; questionId: string }>
}

export default async function Image({ params }: PageProps) {
  const { username, questionId: questionIdParam } = await params
  const questionId = questionIdParam as QuestionId

  let fontRegular: Buffer
  let fontBold: Buffer
  let fontJpRegular: Buffer
  let fontJpBold: Buffer
  try {
    ;[fontRegular, fontBold, fontJpRegular, fontJpBold] = await Promise.all([
      fontRegularPromise,
      fontBoldPromise,
      fontJpRegularPromise,
      fontJpBoldPromise,
    ])
  } catch {
    const fallbackColors = getSignatureColor(null)
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${fallbackColors.gradient[0]} 0%, ${fallbackColors.gradient[1]} 100%)`,
          fontSize: 48,
          fontWeight: 700,
          color: '#FFFFFF',
        }}
      >
        Goongoom
      </div>,
      { ...size }
    )
  }

  let dbUser: Awaited<ReturnType<typeof fetchQuery<typeof api.users.getByUsername>>> | null
  try {
    dbUser = await fetchQuery(api.users.getByUsername, { username })
  } catch {
    const fallbackColors = getSignatureColor(null)
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${fallbackColors.gradient[0]} 0%, ${fallbackColors.gradient[1]} 100%)`,
          fontFamily: 'LINE Seed KR, LINE Seed JP',
          fontSize: 48,
          fontWeight: 700,
          color: '#FFFFFF',
        }}
      >
        Goongoom
      </div>,
      {
        ...size,
        fonts: [
          { name: 'LINE Seed KR', data: fontBold, weight: 700 },
          { name: 'LINE Seed JP', data: fontJpBold, weight: 700 },
        ],
      }
    )
  }

  if (!dbUser) {
    const defaultColors = getSignatureColor(null)
    const t = await getTranslations('og')
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: defaultColors.light.bg,
          fontFamily: 'LINE Seed KR, LINE Seed JP',
          fontSize: 48,
          color: '#6B7280',
        }}
      >
        {t('userNotFound')}
      </div>,
      {
        ...size,
        fonts: [
            { name: 'LINE Seed KR', data: fontRegular, weight: 400 },
            { name: 'LINE Seed JP', data: fontJpRegular, weight: 400 },
          ],
      }
    )
  }

  let qa: Awaited<ReturnType<typeof fetchQuery<typeof api.questions.getByIdAndRecipient>>> | null
  try {
    qa = await fetchQuery(api.questions.getByIdAndRecipient, { id: questionId, recipientClerkId: dbUser.clerkId })
  } catch {
    qa = null
  }

  const locale = getUserLocale(dbUser?.locale)
  const t = await getTranslations({ locale, namespace: 'og' })

  if (!qa?.answer) {
    const userColors = getSignatureColor(dbUser?.signatureColor)
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: userColors.light.bg,
          fontFamily: 'LINE Seed KR, LINE Seed JP',
          fontSize: 48,
          color: '#6B7280',
        }}
      >
        {t('questionNotFound')}
      </div>,
      {
        ...size,
        fonts: [
            { name: 'LINE Seed KR', data: fontRegular, weight: 400 },
            { name: 'LINE Seed JP', data: fontJpRegular, weight: 400 },
          ],
      }
    )
  }

  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')?.value
  const isDark = themeCookie === 'dark'

  const fullName = dbUser.fullName || dbUser.username || username
  const questionContent = clamp(qa.content, 80)
  const answerContent = clamp(qa.answer.content, 100)
  const colors = getSignatureColor(dbUser?.signatureColor)
  const theme = isDark ? colors.dark : colors.light

  let askerAvatarSrc: string
  if (qa.isAnonymous) {
    askerAvatarSrc = getDicebearUrl(qa.anonymousAvatarSeed || qa._id)
  } else if (qa.senderClerkId) {
    const sender = await fetchQuery(api.users.getByClerkId, { clerkId: qa.senderClerkId })
    askerAvatarSrc = sender?.avatarUrl || getDicebearUrl(qa.senderClerkId)
  } else {
    askerAvatarSrc = getDicebearUrl(qa._id)
  }

  const answererAvatarSrc = dbUser.avatarUrl || getDicebearUrl(dbUser.clerkId)

  const [askerAvatarUrl, answererAvatarUrl] = await Promise.all([
    fetchImageAsBase64(askerAvatarSrc),
    fetchImageAsBase64(answererAvatarSrc),
  ])

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '56px',
        backgroundColor: theme.bg,
        fontFamily: 'LINE Seed KR, LINE Seed JP',
        color: isDark ? '#F9FAFB' : '#111827',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
          <img
            alt="Asker"
            height={60}
            src={askerAvatarUrl}
            style={{ borderRadius: '30px', objectFit: 'cover' }}
            width={60}
          />
          <div
            style={{
              display: 'flex',
              maxWidth: '80%',
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderRadius: '32px',
              padding: '32px 40px',
              fontSize: '40px',
              fontWeight: 700,
              lineHeight: 1.4,
              boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            {questionContent}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            gap: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              maxWidth: '80%',
              background: `linear-gradient(135deg, ${colors.gradient[0]} 0%, ${colors.gradient[1]} 100%)`,
              borderRadius: '32px',
              padding: '32px 40px',
              fontSize: '40px',
              fontWeight: 700,
              lineHeight: 1.4,
              color: '#FFFFFF',
            }}
          >
            {answerContent}
          </div>
          <img
            alt={fullName}
            height={60}
            src={answererAvatarUrl}
            style={{ borderRadius: '30px', objectFit: 'cover' }}
            width={60}
          />
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'LINE Seed KR', data: fontRegular, weight: 400 },
        { name: 'LINE Seed KR', data: fontBold, weight: 700 },
        { name: 'LINE Seed JP', data: fontJpRegular, weight: 400 },
        { name: 'LINE Seed JP', data: fontJpBold, weight: 700 },
      ],
    }
  )
}

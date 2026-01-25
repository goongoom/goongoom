import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cookies } from 'next/headers'
import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { getSignatureColor } from '@/lib/colors/signature-colors'

export const runtime = 'nodejs'
export const alt = 'User Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const fontRegularPromise = readFile(join(process.cwd(), 'public/fonts/Pretendard-Regular.otf'))
const fontBoldPromise = readFile(join(process.cwd(), 'public/fonts/Pretendard-Bold.otf'))
const logoPromise = readFile(join(process.cwd(), 'assets/logo.png'))

const clamp = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value)

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function Image({ params }: PageProps) {
  const { username } = await params
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')?.value
  const isDark = themeCookie === 'dark'

  const [fontRegular, fontBold, logoData, t] = await Promise.all([
    fontRegularPromise,
    fontBoldPromise,
    logoPromise,
    getTranslations('og'),
  ])
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`

  const dbUser = await fetchQuery(api.users.getByUsername, { username })
  if (!dbUser) {
    const defaultColors = getSignatureColor(null)
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: defaultColors.light.bg,
          fontFamily: 'Pretendard',
          fontSize: 48,
          color: '#6B7280',
        }}
      >
        {t('userNotFound')}
      </div>,
      {
        ...size,
        fonts: [{ name: 'Pretendard', data: fontRegular, weight: 400 }],
      }
    )
  }

  const colors = getSignatureColor(dbUser?.signatureColor)
  const theme = isDark ? colors.dark : colors.light
  const fullName = dbUser.fullName || dbUser.username || username
  const bio = dbUser?.bio ? clamp(dbUser.bio, 120) : null

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '72px',
        backgroundColor: theme.bg,
        fontFamily: 'Pretendard',
        color: isDark ? '#F9FAFB' : '#111827',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <img alt={t('logoAlt')} height={72} src={logoBase64} style={{ borderRadius: '20px' }} width={72} />
        <div style={{ display: 'flex', fontSize: '40px', fontWeight: 700 }}>{t('appName')}</div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '56px',
          marginTop: '32px',
        }}
      >
        {dbUser.avatarUrl ? (
          <img
            alt={fullName}
            height={220}
            src={dbUser.avatarUrl}
            style={{
              borderRadius: '110px',
              border: `6px solid ${theme.border}`,
              objectFit: 'cover',
            }}
            width={220}
          />
        ) : (
          <div
            style={{
              width: '220px',
              height: '220px',
              borderRadius: '110px',
              backgroundColor: theme.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '88px',
              fontWeight: 700,
              color: theme.primary,
            }}
          >
            {fullName[0] || '?'}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
          }}
        >
          <div style={{ fontSize: '68px', fontWeight: 700, lineHeight: 1.2 }}>{clamp(fullName, 20)}</div>
          <div style={{ fontSize: '40px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
            @{clamp(dbUser.username || username, 24)}
          </div>
          {bio && (
            <div
              style={{
                fontSize: '34px',
                color: isDark ? '#D1D5DB' : '#374151',
                marginTop: '8px',
                lineHeight: 1.4,
              }}
            >
              {bio}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '28px',
          color: isDark ? '#6B7280' : '#9CA3AF',
        }}
      >
        <div>{t('tagline')}</div>
        <div>goongoom.com/{clamp(dbUser.username || username, 16)}</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Pretendard', data: fontRegular, weight: 400 },
        { name: 'Pretendard', data: fontBold, weight: 700 },
      ],
    }
  )
}

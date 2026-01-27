import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cookies } from 'next/headers'
import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { getUserLocale } from '@/i18n/get-user-locale'
import { getSignatureColor } from '@/lib/colors/signature-colors'

export const runtime = 'nodejs'
export const alt = 'User Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const fontRegularPromise = readFile(join(process.cwd(), 'assets/fonts/LINESeedKR-Rg.otf'))
const fontBoldPromise = readFile(join(process.cwd(), 'assets/fonts/LINESeedKR-Bd.otf'))
const fontJpRegularPromise = readFile(join(process.cwd(), 'assets/fonts/LINESeedJP_OTF_Rg.otf'))
const fontJpBoldPromise = readFile(join(process.cwd(), 'assets/fonts/LINESeedJP_OTF_Bd.otf'))
const logoPromise = readFile(join(process.cwd(), 'assets/logo.png'))

const clamp = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value)

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function Image({ params }: PageProps) {
  const { username } = await params

  let fontRegular: Buffer
  let fontBold: Buffer
  let fontJpRegular: Buffer
  let fontJpBold: Buffer
  let logoData: Buffer
  try {
    ;[fontRegular, fontBold, fontJpRegular, fontJpBold, logoData] = await Promise.all([
      fontRegularPromise,
      fontBoldPromise,
      fontJpRegularPromise,
      fontJpBoldPromise,
      logoPromise,
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

  const locale = getUserLocale(dbUser?.locale)
  const t = await getTranslations({ locale, namespace: 'og' })

  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')?.value
  const isDark = themeCookie === 'dark'
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`

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
        fontFamily: 'LINE Seed KR, LINE Seed JP',
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

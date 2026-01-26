import type { MetadataRoute } from 'next'
import { getUserLocale } from '@/i18n/request'

const manifestStrings = {
  ko: {
    name: '궁금닷컴',
    short_name: '궁금닷컴',
    description: '궁금한 것을 물어보고 답변을 받아보세요',
  },
  en: {
    name: 'Goongoom',
    short_name: 'Goongoom',
    description: 'Ask questions and get answers',
  },
  ja: {
    name: 'Goongoom',
    short_name: 'Goongoom',
    description: '質問して回答をもらおう',
  },
} as const

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await getUserLocale()
  const strings = manifestStrings[locale]

  return {
    name: strings.name,
    short_name: strings.short_name,
    description: strings.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#fdf2f8',
    theme_color: '#E1306C',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

'use client'

import { useLocale } from 'next-intl'
import { MainContent } from '@/components/layout/main-content'
import PrivacyKo from '@/content/legal/privacy.ko.mdx'
import PrivacyEn from '@/content/legal/privacy.en.mdx'
import PrivacyJa from '@/content/legal/privacy.ja.mdx'

const privacyContent = { ko: PrivacyKo, en: PrivacyEn, ja: PrivacyJa } as const

export default function PrivacyPage() {
  const locale = useLocale()
  const Content = privacyContent[locale as keyof typeof privacyContent] ?? PrivacyEn

  return (
    <MainContent>
      <div className="py-4">
        <Content />
      </div>
    </MainContent>
  )
}

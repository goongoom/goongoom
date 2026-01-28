'use client'

import { useLocale } from 'next-intl'
import { MainContent } from '@/components/layout/main-content'
import TermsKo from '@/content/legal/terms.ko.mdx'
import TermsEn from '@/content/legal/terms.en.mdx'
import TermsJa from '@/content/legal/terms.ja.mdx'

const termsContent = { ko: TermsKo, en: TermsEn, ja: TermsJa } as const

export default function TermsPage() {
  const locale = useLocale()
  const Content = termsContent[locale as keyof typeof termsContent] ?? TermsEn

  return (
    <MainContent>
      <div className="py-4">
        <Content />
      </div>
    </MainContent>
  )
}

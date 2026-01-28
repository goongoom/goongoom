'use client'

import { useLocale } from 'next-intl'
import { MainContent } from '@/components/layout/main-content'
import ContactKo from '@/content/legal/contact.ko.mdx'
import ContactEn from '@/content/legal/contact.en.mdx'
import ContactJa from '@/content/legal/contact.ja.mdx'

const contactContent = { ko: ContactKo, en: ContactEn, ja: ContactJa } as const

export default function ContactPage() {
  const locale = useLocale()
  const Content = contactContent[locale as keyof typeof contactContent] ?? ContactEn

  return (
    <MainContent>
      <div className="py-4">
        <Content />
      </div>
    </MainContent>
  )
}

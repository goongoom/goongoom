import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { MainContent } from '@/components/layout/main-content'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('footer')
  return {
    title: t('contact'),
  }
}

export default async function ContactPage() {
  const locale = await getLocale()

  const Content =
    locale === 'ko'
      ? (await import('@/content/legal/contact.ko.mdx')).default
      : (await import('@/content/legal/contact.en.mdx')).default

  return (
    <MainContent>
      <div className="py-4">
        <Content />
      </div>
    </MainContent>
  )
}

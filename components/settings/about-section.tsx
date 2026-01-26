'use client'

import {
  Agreement01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Bug02Icon,
  Idea01Icon,
  SecurityCheckIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const ANACLUMOS_URL = 'https://goongoom.com/anaclumos'

export function AboutSection() {
  const t = useTranslations('settings')
  const tFooter = useTranslations('footer')

  return (
    <Card>
      <CardContent className="py-0">
        <div className="divide-y divide-border/30">
          <Link className="group flex items-center gap-3 py-3 transition-colors" href="/terms">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 transition-colors">
              <HugeiconsIcon
                className="size-4 text-muted-foreground transition-colors"
                icon={Agreement01Icon}
                strokeWidth={2}
              />
            </div>
            <span className="flex-1 font-medium text-muted-foreground text-sm transition-colors">
              {tFooter('terms')}
            </span>
            <HugeiconsIcon
              className="size-4 text-muted-foreground/50 transition-all"
              icon={ArrowRight01Icon}
              strokeWidth={2}
            />
          </Link>

          <Link className="group flex items-center gap-3 py-3 transition-colors" href="/privacy">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 transition-colors">
              <HugeiconsIcon
                className="size-4 text-muted-foreground transition-colors"
                icon={SecurityCheckIcon}
                strokeWidth={2}
              />
            </div>
            <span className="flex-1 font-medium text-muted-foreground text-sm transition-colors">
              {tFooter('privacy')}
            </span>
            <HugeiconsIcon
              className="size-4 text-muted-foreground/50 transition-all"
              icon={ArrowRight01Icon}
              strokeWidth={2}
            />
          </Link>
          <Link className="group flex items-center gap-3 py-3 transition-colors" href={ANACLUMOS_URL}>
            <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 transition-colors">
              <HugeiconsIcon
                className="size-4 text-muted-foreground transition-colors"
                icon={UserIcon}
                strokeWidth={2}
              />
            </div>
            <span className="flex-1 font-medium text-muted-foreground text-sm transition-colors">{t('madeBy')}</span>
            <HugeiconsIcon
              className="size-4 text-muted-foreground/50 transition-all"
              icon={ArrowUpRight01Icon}
              strokeWidth={2}
            />
          </Link>

          <Link className="group flex items-center gap-3 py-3 transition-colors" href={ANACLUMOS_URL}>
            <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 transition-colors">
              <HugeiconsIcon
                className="size-4 text-muted-foreground transition-colors"
                icon={Bug02Icon}
                strokeWidth={2}
              />
            </div>
            <span className="flex-1 font-medium text-muted-foreground text-sm transition-colors">{t('reportBug')}</span>
            <HugeiconsIcon
              className="size-4 text-muted-foreground/50 transition-all"
              icon={ArrowUpRight01Icon}
              strokeWidth={2}
            />
          </Link>

          <Link className="group flex items-center gap-3 py-3 transition-colors" href={ANACLUMOS_URL}>
            <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 transition-colors">
              <HugeiconsIcon
                className="size-4 text-muted-foreground transition-colors"
                icon={Idea01Icon}
                strokeWidth={2}
              />
            </div>
            <span className="flex-1 font-medium text-muted-foreground text-sm transition-colors">
              {t('suggestFeature')}
            </span>
            <HugeiconsIcon
              className="size-4 text-muted-foreground/50 transition-all"
              icon={ArrowUpRight01Icon}
              strokeWidth={2}
            />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

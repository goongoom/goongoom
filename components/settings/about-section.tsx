'use client'

import { ArrowUpRight01Icon, Bug02Icon, Idea01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'

const ANACLUMOS_URL = 'https://goongoom.com/anaclumos'

export function AboutSection() {
  const t = useTranslations('settings')

  return (
    <Card>
      <CardContent className="py-0">
        <div className="divide-y divide-border/30">
           <a
             className="group flex items-center gap-3 py-3 transition-colors"
             href={ANACLUMOS_URL}
             rel="noopener noreferrer"
             target="_blank"
           >
             <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 transition-colors">
               <HugeiconsIcon
                 className="size-4 text-muted-foreground transition-colors"
                icon={UserIcon}
                strokeWidth={2}
              />
            </div>
             <span className="flex-1 font-medium text-muted-foreground text-sm transition-colors">
               {t('madeBy')}
             </span>
             <HugeiconsIcon
               className="size-4 text-muted-foreground/50 transition-all"
              icon={ArrowUpRight01Icon}
              strokeWidth={2}
            />
          </a>

           <a
             className="group flex items-center gap-3 py-3 transition-colors"
             href={ANACLUMOS_URL}
             rel="noopener noreferrer"
             target="_blank"
           >
             <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 transition-colors">
               <HugeiconsIcon
                 className="size-4 text-muted-foreground transition-colors"
                icon={Bug02Icon}
                strokeWidth={2}
              />
            </div>
             <span className="flex-1 font-medium text-muted-foreground text-sm transition-colors">
               {t('reportBug')}
             </span>
             <HugeiconsIcon
               className="size-4 text-muted-foreground/50 transition-all"
              icon={ArrowUpRight01Icon}
              strokeWidth={2}
            />
          </a>

           <a
             className="group flex items-center gap-3 py-3 transition-colors"
             href={ANACLUMOS_URL}
             rel="noopener noreferrer"
             target="_blank"
           >
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
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

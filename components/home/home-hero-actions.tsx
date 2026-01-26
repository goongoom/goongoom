'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex-helpers/react/cache/hooks'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { HomeCTAButtons } from '@/components/home/home-cta-buttons'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/convex/_generated/api'

interface HomeHeroActionsProps {
  startLabel: string
  loginLabel: string
  profileLabel: string
}

export function HomeHeroActions({ startLabel, loginLabel, profileLabel }: HomeHeroActionsProps) {
  const tLanding = useTranslations('landing')
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const shouldSkipCount = isLoaded && !!user?.username
  const answerCount = useQuery(api.answers.count, shouldSkipCount ? 'skip' : {})

  useEffect(() => {
    if (isLoaded && user?.username) {
      router.prefetch(`/${user.username}`)
      router.replace(`/${user.username}`)
    }
  }, [isLoaded, user?.username, router])

  const isRedirecting = isLoaded && !!user?.username

  if (isRedirecting) {
    return null
  }

  return (
    <>
      <HomeCTAButtons
        startLabel={startLabel}
        loginLabel={loginLabel}
        isLoggedIn={isLoaded && !!user}
        profileLabel={profileLabel}
        profileUrl={user?.username ? `/${user.username}` : undefined}
      />
      <div className="mt-8 text-sm text-muted-foreground">
        {answerCount === undefined ? (
          <Skeleton className="mx-auto h-5 w-48" />
        ) : (
          tLanding('trustIndicator', { count: answerCount })
        )}
      </div>
    </>
  )
}

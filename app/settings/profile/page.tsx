'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useConvexAuth, useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'
import { MainContent } from '@/components/layout/main-content'
import { ProfileEditForm } from '@/components/settings/profile-edit-form'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/convex/_generated/api'
import { DEFAULT_SIGNATURE_COLOR, isValidSignatureColor } from '@/lib/colors/signature-colors'
import type { QuestionSecurityLevel } from '@/lib/question-security'

export default function ProfileSettingsPage() {
  const { userId: clerkId } = useAuth()
  const { user, isLoaded: isUserLoaded } = useUser()
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
  const router = useRouter()

  const t = useTranslations('settings')
  const tSecurity = useTranslations('questionSecurity')

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthLoading, isAuthenticated, router])

  const dbUser = useQuery(
    api.users.getByClerkId,
    clerkId ? { clerkId } : 'skip'
  )

  const securityOptions = useMemo(
    (): Record<QuestionSecurityLevel, { label: string; description: string }> => ({
      anyone: {
        label: tSecurity('anyoneLabel'),
        description: tSecurity('anyoneDescription'),
      },
      verified_anonymous: {
        label: tSecurity('verifiedLabel'),
        description: tSecurity('verifiedDescription'),
      },
      public_only: {
        label: tSecurity('identifiedOnlyLabel'),
        description: tSecurity('identifiedOnlyDescription'),
      },
    }),
    [tSecurity]
  )

  if (isAuthLoading || !isAuthenticated || !isUserLoaded) {
    return (
      <MainContent>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner className="size-8" />
        </div>
      </MainContent>
    )
  }

  if (!user) {
    return (
      <MainContent>
        <h1 className="mb-2 font-bold text-3xl text-foreground">{t('profileSettings')}</h1>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('profileRequired')}</EmptyTitle>
            <EmptyDescription>{t('profileRequiredDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </MainContent>
    )
  }

  const isLoading = dbUser === undefined

  if (isLoading) {
    return (
      <MainContent>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner className="size-8" />
        </div>
      </MainContent>
    )
  }

  const initialSocialLinks = dbUser?.socialLinks || null
  const securityLevel = dbUser?.questionSecurityLevel || 'public'
  const signatureColor =
    dbUser?.signatureColor && isValidSignatureColor(dbUser.signatureColor)
      ? dbUser.signatureColor
      : DEFAULT_SIGNATURE_COLOR

  return (
    <MainContent>
      <div className="mb-8 space-y-2">
        <h1 className="font-bold text-3xl text-foreground">{t('profileSettings')}</h1>
        <p className="text-muted-foreground text-sm">{t('profileSettingsDescription')}</p>
      </div>

      <ProfileEditForm
        initialBio={dbUser?.bio || null}
        initialQuestionSecurityLevel={securityLevel}
        initialSignatureColor={signatureColor}
        initialSocialLinks={initialSocialLinks}
        securityOptions={securityOptions}
      />
    </MainContent>
  )
}
